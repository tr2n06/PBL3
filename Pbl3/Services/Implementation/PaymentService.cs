using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Threading.Tasks;
using Pbl3.DataAccess.Models.Bookings;
using Pbl3.DataAccess.Models.Payment;
using Pbl3.DataAccess.Models.Users;
using Pbl3.DataAccess.Models.Flights;
using Pbl3.DataAccess.Models.Others;
using Pbl3.DTOs.Bookings;
using Pbl3.DTOs.Baggage;
using Pbl3.DTOs.Flight;
using Pbl3.Repositories.Interface;
using Pbl3.Services.Interface;
using Microsoft.Extensions.Caching.Memory;

namespace Pbl3.Services.Implementation
{
    public class PaymentService : IPaymentService
    {
        private readonly IPaymentRepository _paymentRepository;
        private readonly IBookingService _bookingService;
        private readonly ITicketService _ticketService;
        private readonly IBaggageService _baggageService;
        private readonly IFlightService _flightService;
        private readonly IMailService _mailService;
        private readonly IMemoryCache _cache;

        public PaymentService(IPaymentRepository paymentRepository, IBookingService bookingService, ITicketService ticketService, IBaggageService baggageService, IFlightService flightService, IMailService mailService, IMemoryCache cache)
        {
            _paymentRepository = paymentRepository;
            _bookingService = bookingService;
            _ticketService = ticketService;
            _baggageService = baggageService;
            _flightService = flightService;
            _mailService = mailService;
            _cache = cache;
        }

        public async Task<object> ProcessPaymentCompleteAsync(CompletePaymentRequestDTO request, int? loggedInUserId, string? userType, string? clientHost)
        {
            string host = (string.IsNullOrEmpty(clientHost) || clientHost == "localhost" || clientHost == "127.0.0.1" || clientHost == "::1") ? GetLocalIPAddress() : clientHost;

            // Validate payment method based on user role
            string method = request.paymentMethod?.ToLower();
            if (string.IsNullOrEmpty(method))
            {
                throw new ArgumentException("Payment method is required.");
            }

            if (userType == "Staff")
            {
                if (method != "cash" && method != "qr" && method != "pending")
                {
                    throw new InvalidOperationException("Staff can only choose payment methods: Cash or QR.");
                }
            }
            else // Guest or Customer
            {
                if (method != "qr" && method != "pending")
                {
                    throw new InvalidOperationException("Customers and guests can only pay via QR code.");
                }
            }

            // 1. Generate unique Booking Reference
            string bookingRef = request.bookingRef;
            
            // If bookingRef is provided and booking exists in database, handle payment update or retrieval
            if (!string.IsNullOrEmpty(bookingRef))
            {
                var existingBooking = await _paymentRepository.GetBookingByCodeAsync(bookingRef);
                if (existingBooking != null)
                {
                    if (request.paymentMethod.ToLower() == "pending")
                    {
                        return new
                        {
                            success = true,
                            bookingRef = bookingRef
                        };
                    }
                    else if (request.paymentMethod.ToLower() == "qr")
                    {
                        string gatewayUrl = $"http://{host}:3000/checkout";
                        string backendUrl = $"http://{host}:5290";
                        string qrLink = $"{gatewayUrl}?orderId={bookingRef}&amount={(int)existingBooking.bookedPrice}&info={Uri.EscapeDataString("Thanh toan ve " + bookingRef)}&backend={Uri.EscapeDataString(backendUrl)}";

                        return new
                        {
                            success = true,
                            paymentMethod = "qr",
                            bookingRef = bookingRef,
                            qrLink = qrLink
                        };
                    }
                }
            }

            if (string.IsNullOrEmpty(bookingRef))
            {
                bookingRef = await _bookingService.createCodeBooking();
            }

            // 2. Parse Flight ID details (e.g., VN123-01062026-123000)
            string[] parts = request.flightId.Split('-');
            string codeFlight = parts[0];
            DateOnly departureDate = DateOnly.ParseExact(parts[1], "ddMMyyyy");
            TimeOnly departureTime = TimeOnly.ParseExact(parts[2], "HHmmss");

            bool isQR = request.paymentMethod.ToLower() == "qr" || request.paymentMethod.ToLower() == "pending";
            string transactionStatus = isQR ? "pending" : "confirmed";

            // 3. Create and Save Transaction
            string txnCode = "TXN_" + bookingRef;
            var transaction = new Transaction
            {
                codeTransaction = txnCode,
                sourceBank = isQR ? "pending" : (request.paymentMethod.ToLower() == "card" ? "VISA/MASTERCARD" : "CASH"),
                sourceAccount = isQR ? "pending" : (request.paymentMethod.ToLower() == "card" ? "Mock Card *9999" : "Cash Over Counter"),
                beneficiaryBank = "VjpHangKhongBank",
                beneficiaryAccount = "1234567890",
                transactionAmount = (int)request.totalPrice,
                timeTransaction = DateTime.UtcNow
            };
            await _paymentRepository.InsertTransactionAsync(transaction);

            // 4. Create and Save Booking
            var bookingDto = new BookingRequestDTO
            {
                codeBooking = bookingRef,
                idUser = loggedInUserId,
                codeTransaction = txnCode,
                bookedPrice = request.totalPrice,
                bookedTime = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss")
            };
            await _bookingService.insertBooking(bookingDto);

            // 5. Deduct points first for logged-in passengers if points are used
            Passenger passenger = null;
            if (loggedInUserId.HasValue && loggedInUserId.Value >= 51)
            {
                passenger = await _paymentRepository.GetPassengerByIdAsync(loggedInUserId.Value);
                if (passenger != null && request.pointsUsed > 0)
                {
                    passenger.pointReward = Math.Max(0, passenger.pointReward - request.pointsUsed);
                }
            }

            int firstAdultIdx = request.passengers.FindIndex(pass => pass.passengerType == "adult");

            // 6. Create Tickets
            for (int i = 0; i < request.passengers.Count; i++)
            {
                var p = request.passengers[i];
                string ticketCode = await _ticketService.createTicketCode();

                decimal adultBasePrice = (firstAdultIdx != -1 && request.basePrices.Count > firstAdultIdx) ? request.basePrices[firstAdultIdx] : 0;
                decimal finalPrice = request.basePrices.ElementAtOrDefault(i);
                if (p.passengerType == "infant")
                {
                    finalPrice = adultBasePrice * 0.4m;
                }
                else if (p.passengerType == "child")
                {
                    finalPrice = adultBasePrice * 0.8m;
                }

                string seatCode = null;
                if (p.passengerType == "infant")
                {
                    seatCode = (firstAdultIdx != -1 && request.seatNumbers.Count > firstAdultIdx) ? request.seatNumbers[firstAdultIdx] : null;
                }
                else
                {
                    seatCode = (request.seatNumbers.Count > i) ? request.seatNumbers[i] : null;
                }

                var ticketDto = new TicketRequestDTO
                {
                    codeTicket = ticketCode,
                    codeBooking = bookingRef,
                    codeFlight = codeFlight,
                    departureDate = departureDate,
                    departureTime = departureTime,
                    codeSeat = seatCode,
                    name = $"{p.firstName} {p.middleName} {p.lastName}".Replace("  ", " ").Trim().ToUpper(),
                    gender = p.gender,
                    identityCard = p.cccd,
                    email = p.email,
                    passengerType = p.passengerType,
                    state = transactionStatus,
                    CanSelectSeat = (p.passengerType != "infant") && !string.IsNullOrEmpty(seatCode),
                    price = finalPrice,
                    dateOfBirth = DateOnly.Parse(p.dateOfBirth)
                };

                // Safety check: verify if the seat is already booked/pending in the database (skip for infants)
                if (!string.IsNullOrEmpty(ticketDto.codeSeat) && p.passengerType != "infant")
                {
                    bool isAlreadyBooked = await _paymentRepository.IsSeatAlreadyBookedAsync(ticketDto.codeSeat, codeFlight, departureDate, departureTime);
                    if (isAlreadyBooked)
                    {
                        throw new InvalidOperationException($"Seat {ticketDto.codeSeat} is already booked on flight {codeFlight} at {departureDate} {departureTime}. Please select a different seat.");
                    }
                }

                await _ticketService.insertTicket(ticketDto);

                // Add baggage if applicable
                int checkedB = 0, cabinB = 0;
                string seatType = (request.seatTypes != null && request.seatTypes.Count > i) ? request.seatTypes[i] : "economy";
                if (seatType == "firstClass") {
                    checkedB = 35; cabinB = 12;
                }
                else if (seatType == "business") {
                    checkedB = 25; cabinB = 7;
                }
                else {
                    checkedB = 20; cabinB = 0;
                }
                if (request.extraBaggageKg != null && request.extraBaggageKg.Count > i && request.extraBaggageKg[i] > 0)
                {
                    checkedB += request.extraBaggageKg[i];
                }
                var outboundBaggageDto = new BaggageRequestDTO
                    {
                        codeTransaction = txnCode,
                        codeTicket = ticketCode,
                        weight = checkedB,
                        type = "checked",
                        status = transactionStatus
                    };
                await _baggageService.insertBaggage(outboundBaggageDto);
                if (cabinB != 0) {
                    outboundBaggageDto = new BaggageRequestDTO
                    {
                        codeTransaction = txnCode,
                        codeTicket = ticketCode,
                        weight = cabinB,
                        type = "cabin",
                        status = transactionStatus
                    };
                    await _baggageService.insertBaggage(outboundBaggageDto);
                } 

                // Lock the flight seat immediately upon booking/ticket creation to prevent duplicate selection database crashes
                if (!string.IsNullOrEmpty(ticketDto.codeSeat) && p.passengerType != "infant")
                {
                    await _flightService.updateSeatFlight(new SeatSelectionDTO
                    {
                        codeSeat = ticketDto.codeSeat,
                        codeFlight = codeFlight,
                        departureDate = departureDate,
                        departureTime = departureTime,
                        isBooked = true
                    });
                }

                // If return flight is selected
                if (!string.IsNullOrEmpty(request.returnFlightId))
                {
                    string[] retParts = request.returnFlightId.Split('-');
                    string retCodeFlight = retParts[0];
                    DateOnly retDepartureDate = DateOnly.ParseExact(retParts[1], "ddMMyyyy");
                    TimeOnly retDepartureTime = TimeOnly.ParseExact(retParts[2], "HHmmss");

                    string returnTicketCode = await _ticketService.createTicketCode();

                    decimal returnAdultBasePrice = (firstAdultIdx != -1 && request.returnBasePrices != null && request.returnBasePrices.Count > firstAdultIdx) ? request.returnBasePrices[firstAdultIdx] : 0;
                    decimal returnFinalPrice = (request.returnBasePrices != null && request.returnBasePrices.Count > i) ? request.returnBasePrices[i] : 0;
                    if (p.passengerType == "infant")
                    {
                        returnFinalPrice = returnAdultBasePrice * 0.4m;
                    }
                    else if (p.passengerType == "child")
                    {
                        returnFinalPrice = returnAdultBasePrice * 0.8m;
                    }

                    string returnSeatCode = null;
                    if (p.passengerType == "infant")
                    {
                        returnSeatCode = (firstAdultIdx != -1 && request.returnSeatNumbers != null && request.returnSeatNumbers.Count > firstAdultIdx) ? request.returnSeatNumbers[firstAdultIdx] : null;
                    }
                    else
                    {
                        returnSeatCode = (request.returnSeatNumbers != null && request.returnSeatNumbers.Count > i) ? request.returnSeatNumbers[i] : null;
                    }

                    var returnTicketDto = new TicketRequestDTO
                    {
                        codeTicket = returnTicketCode,
                        codeBooking = bookingRef,
                        codeFlight = retCodeFlight,
                        departureDate = retDepartureDate,
                        departureTime = retDepartureTime,
                        codeSeat = returnSeatCode,
                        name = $"{p.firstName} {p.middleName} {p.lastName}".Replace("  ", " ").Trim().ToUpper(),
                        gender = p.gender,
                        identityCard = p.cccd,
                        email = p.email,
                        passengerType = p.passengerType,
                        state = transactionStatus,
                        CanSelectSeat = (p.passengerType != "infant") && request.returnSeatNumbers != null && !string.IsNullOrEmpty(returnSeatCode),
                        price = returnFinalPrice,
                        dateOfBirth = DateOnly.Parse(p.dateOfBirth)
                    };

                    // Safety check for return flight seat (skip for infants)
                    if (!string.IsNullOrEmpty(returnTicketDto.codeSeat) && p.passengerType != "infant")
                    {
                        bool isReturnAlreadyBooked = await _paymentRepository.IsSeatAlreadyBookedAsync(returnTicketDto.codeSeat, retCodeFlight, retDepartureDate, retDepartureTime);
                        if (isReturnAlreadyBooked)
                        {
                            throw new InvalidOperationException($"Seat {returnTicketDto.codeSeat} is already booked on return flight {retCodeFlight} at {retDepartureDate} {retDepartureTime}. Please select a different seat.");
                        }
                    }

                    await _ticketService.insertTicket(returnTicketDto);

                    string returnSeatType = (request.returnSeatTypes != null && request.returnSeatTypes.Count > i) 
                        ? request.returnSeatTypes[i] 
                        : ((request.seatTypes != null && request.seatTypes.Count > i) ? request.seatTypes[i] : "economy");
                    if (returnSeatType == "firstClass") {
                        checkedB = 35; cabinB = 12;
                    }
                    else if (returnSeatType == "business") {
                        checkedB = 25; cabinB = 7;
                    }
                    else {
                        checkedB = 20; cabinB = 0;
                    }
                    if (request.extraBaggageKg != null && request.extraBaggageKg.Count > i && request.extraBaggageKg[i] > 0)
                    {
                        checkedB += request.extraBaggageKg[i];
                    }
                    var returnBaggageDto = new BaggageRequestDTO
                        {
                            codeTransaction = txnCode,
                            codeTicket = returnTicketCode,
                            weight = checkedB,
                            type = "checked",
                            status = transactionStatus
                        };
                    await _baggageService.insertBaggage(returnBaggageDto);
                    if (cabinB != 0) {
                        returnBaggageDto = new BaggageRequestDTO
                        {
                            codeTransaction = txnCode,
                            codeTicket = returnTicketCode,
                            weight = cabinB,
                            type = "cabin",
                            status = transactionStatus
                        };
                        await _baggageService.insertBaggage(returnBaggageDto);
                    } 

                    if (!string.IsNullOrEmpty(returnTicketDto.codeSeat) && p.passengerType != "infant")
                    {
                        await _flightService.updateSeatFlight(new SeatSelectionDTO
                        {
                            codeSeat = returnTicketDto.codeSeat,
                            codeFlight = retCodeFlight,
                            departureDate = retDepartureDate,
                            departureTime = retDepartureTime,
                            isBooked = true
                        });
                    }

                    // Link outbound and return tickets in RoundTickets
                    await _ticketService.insertRoadTickets(ticketCode, returnTicketCode);
                }
            }

            // Add points reward for Card/Cash
            if (!isQR && passenger != null && request.pointsEarned > 0)
            {
                passenger.pointReward += request.pointsEarned;
            }

            await _paymentRepository.SaveChangesAsync();

            // 7. Handle QR Checkout flow by generating QR Link pointing to checkout gateway Vite app
            if (isQR)
            {
                // Default local port of Vite mock-checkout gateway app was 5173, changed to 3000 (Next.js)
                string gatewayUrl = $"http://{host}:3000/checkout";
                string backendUrl = $"http://{host}:5290"; // Main backend port
                
                string qrLink = $"{gatewayUrl}?orderId={bookingRef}&amount={(int)request.totalPrice}&info={Uri.EscapeDataString("Thanh toan ve " + bookingRef)}&backend={Uri.EscapeDataString(backendUrl)}";

                return new
                {
                    success = true,
                    paymentMethod = "qr",
                    bookingRef = bookingRef,
                    qrLink = qrLink
                };
            }

            if (!isQR)
            {
                await SendBookingConfirmationEmailAsync(bookingRef);
            }

            return new
            {
                success = true,
                paymentMethod = request.paymentMethod,
                bookingRef = bookingRef
            };
        }

        public async Task<object> ConfirmPaymentAsync(string orderId, string bankName, string accountNumber, string accountName, long amount)
        {
            if (_cache.TryGetValue(GetTicketActionCacheKey(orderId), out TicketActionPaymentRequestDTO actionRequest))
            {
                return await ConfirmTicketActionPaymentAsync(new TicketActionPaymentConfirmDTO
                {
                    TransactionCode = orderId,
                    PaymentMethod = "qr",
                    SourceBank = bankName,
                    SourceAccount = accountNumber,
                    AccountName = accountName
                });
            }

            // Find booking by reference (OrderId from the mock checkout is bookingRef)
            var booking = await _paymentRepository.GetBookingByCodeAsync(orderId);
            if (booking == null)
            {
                return new { success = false, message = $"Booking {orderId} not found!" };
            }

            // Update Transaction details
            if (booking.transaction != null)
            {
                booking.transaction.sourceBank = bankName;
                booking.transaction.sourceAccount = $"{accountNumber} ({accountName})";
                booking.transaction.timeTransaction = DateTime.UtcNow;
            }

            // 1. Confirm all Tickets and Baggages
            foreach (var ticket in booking.tickets)
            {
                if (ticket.status == "pending")
                {
                    ticket.status = "confirmed";

                    // 2. Lock flight seat status
                    if (!string.IsNullOrEmpty(ticket.codeSeat))
                    {
                        await _flightService.updateSeatFlight(new SeatSelectionDTO
                        {
                            codeSeat = ticket.codeSeat,
                            codeFlight = ticket.codeFlight,
                            departureDate = ticket.departureDate,
                            departureTime = ticket.departureTime,
                            isBooked = true
                        });
                    }
                }

                // 3. Confirm all baggages for this ticket
                foreach (var baggage in ticket.baggages)
                {
                    baggage.status = "confirmed";
                }
            }

            // 4. Reward points for QR payment since it is now confirmed
            if (booking.idUser.HasValue && booking.idUser.Value >= 51)
            {
                var passenger = await _paymentRepository.GetPassengerByIdAsync(booking.idUser.Value);
                if (passenger != null)
                {
                    int pointsEarned = (int)Math.Floor(booking.bookedPrice / 1000000);
                    passenger.pointReward += pointsEarned;
                }
            }

            await _paymentRepository.SaveChangesAsync();

            await SendBookingConfirmationEmailAsync(orderId);

            Console.WriteLine($"[SUCCESS] Booking {orderId} successfully confirmed via QR Payment!");

            return new { success = true, message = "Payment successfully confirmed and tickets generated!" };
        }

        public async Task<object> ConfirmSuccessPaymentAsync(PaymentConfirmSuccessRequestDTO request)
        {
            var booking = await _paymentRepository.GetBookingByCodeAsync(request.bookingRef);
            if (booking == null)
            {
                return new { success = false, message = $"Booking {request.bookingRef} not found!" };
            }

            if (booking.transaction == null)
            {
                booking.transaction = new Transaction
                {
                    codeTransaction = "TXN_" + request.bookingRef,
                    beneficiaryBank = "Skylines",
                    beneficiaryAccount = "102102102",
                    transactionAmount = (int)request.amount,
                    timeTransaction = DateTime.UtcNow
                };
                await _paymentRepository.InsertTransactionAsync(booking.transaction);
            }

            booking.transaction.sourceBank = request.sourceBank ?? (request.paymentMethod.ToLower() == "card" ? "VISA/MASTERCARD" : "CASH");
            booking.transaction.sourceAccount = request.sourceAccount ?? (request.paymentMethod.ToLower() == "card" ? "Mock Card *9999" : "Cash Over Counter");
            booking.transaction.beneficiaryBank = "Skylines";
            booking.transaction.beneficiaryAccount = "102102102";
            booking.transaction.transactionAmount = (int)request.amount;
            booking.transaction.timeTransaction = DateTime.UtcNow;

            foreach (var ticket in booking.tickets)
            {
                ticket.status = "confirmed";

                if (!string.IsNullOrEmpty(ticket.codeSeat))
                {
                    await _flightService.updateSeatFlight(new SeatSelectionDTO
                    {
                        codeSeat = ticket.codeSeat,
                        codeFlight = ticket.codeFlight,
                        departureDate = ticket.departureDate,
                        departureTime = ticket.departureTime,
                        isBooked = true
                    });
                }

                foreach (var baggage in ticket.baggages)
                {
                    baggage.status = "confirmed";
                }
            }

            if (booking.idUser.HasValue && booking.idUser.Value >= 51)
            {
                var passenger = await _paymentRepository.GetPassengerByIdAsync(booking.idUser.Value);
                if (passenger != null)
                {
                    int pointsEarned = (int)Math.Floor(booking.bookedPrice / 1000000);
                    passenger.pointReward += pointsEarned;
                }
            }

            await _paymentRepository.SaveChangesAsync();

            await SendBookingConfirmationEmailAsync(request.bookingRef);

            return new { success = true, message = "Payment successfully confirmed and tickets generated!" };
        }

        public async Task<object> InitiateTicketActionPaymentAsync(TicketActionPaymentRequestDTO request, string? clientHost)
        {
            if (string.IsNullOrWhiteSpace(request.TicketId))
            {
                throw new ArgumentException("TicketId is required.");
            }

            string actionType = request.ActionType?.ToLower().Trim() ?? "";
            string method = request.PaymentMethod?.ToLower().Trim() ?? "";
            if (actionType != "upgrade" && actionType != "baggage")
            {
                throw new ArgumentException("Invalid ticket action.");
            }
            if (method != "card" && method != "qr" && method != "cash")
            {
                throw new ArgumentException("Invalid payment method.");
            }

            decimal expectedAmount = request.Amount;
            if (actionType == "upgrade")
            {
                if (string.IsNullOrWhiteSpace(request.NewClass))
                {
                    throw new ArgumentException("NewClass is required.");
                }
                expectedAmount = await _ticketService.CalculateUpgradeAmountAsync(request.TicketId, request.NewClass, request.SeatFee);
            }
            else
            {
                if (!request.ExtraCheckedKg.HasValue || request.ExtraCheckedKg.Value <= 0)
                {
                    throw new ArgumentException("Extra checked baggage must be greater than zero.");
                }
                expectedAmount = request.ExtraCheckedKg.Value * 40000m;
            }

            request.Amount = expectedAmount;
            string transactionCode = GenerateTicketActionTransactionCode(actionType);
            var isQr = method == "qr";
            var transaction = new Transaction
            {
                codeTransaction = transactionCode,
                sourceBank = isQr ? "pending" : method.ToUpper(),
                sourceAccount = isQr ? "pending" : "Pending confirmation",
                beneficiaryBank = "Skylines",
                beneficiaryAccount = "102102102",
                transactionAmount = (int)Math.Round(expectedAmount),
                timeTransaction = DateTime.UtcNow
            };

            await _paymentRepository.InsertTransactionAsync(transaction);
            await _paymentRepository.SaveChangesAsync();

            _cache.Set(GetTicketActionCacheKey(transactionCode), request, TimeSpan.FromMinutes(30));

            if (isQr)
            {
                string host = (string.IsNullOrEmpty(clientHost) || clientHost == "localhost" || clientHost == "127.0.0.1" || clientHost == "::1") ? GetLocalIPAddress() : clientHost;
                string gatewayUrl = $"http://{host}:3000/checkout";
                string backendUrl = $"http://{host}:5290";
                string qrLink = $"{gatewayUrl}?orderId={transactionCode}&amount={(int)expectedAmount}&info={Uri.EscapeDataString("Thanh toan dich vu ve " + request.TicketId)}&backend={Uri.EscapeDataString(backendUrl)}";

                return new
                {
                    success = true,
                    paymentMethod = "qr",
                    transactionCode,
                    amount = expectedAmount,
                    qrLink
                };
            }

            return new
            {
                success = true,
                paymentMethod = method,
                transactionCode,
                amount = expectedAmount
            };
        }

        public async Task<object> ConfirmTicketActionPaymentAsync(TicketActionPaymentConfirmDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.TransactionCode))
            {
                throw new ArgumentException("TransactionCode is required.");
            }

            string cacheKey = GetTicketActionCacheKey(request.TransactionCode);
            if (!_cache.TryGetValue(cacheKey, out TicketActionPaymentRequestDTO actionRequest))
            {
                throw new InvalidOperationException("Pending ticket action payment not found or expired.");
            }

            var transaction = await _paymentRepository.GetTransactionByCodeAsync(request.TransactionCode);
            if (transaction == null)
            {
                throw new InvalidOperationException("Transaction not found.");
            }

            string method = request.PaymentMethod?.ToLower().Trim() ?? actionRequest.PaymentMethod?.ToLower().Trim() ?? "";
            transaction.sourceBank = request.SourceBank ?? (method == "card" ? "VISA/MASTERCARD" : method.ToUpper());
            transaction.sourceAccount = request.SourceAccount != null && request.AccountName != null
                ? $"{request.SourceAccount} ({request.AccountName})"
                : (request.SourceAccount ?? "Confirmed");
            transaction.timeTransaction = DateTime.UtcNow;

            if (actionRequest.ActionType.ToLower() == "upgrade")
            {
                await _ticketService.upgradeTicket(actionRequest.TicketId, new UpgradeTicketRequestDTO
                {
                    TicketId = actionRequest.TicketId,
                    NewClass = actionRequest.NewClass ?? "",
                    SeatNumber = actionRequest.SeatNumber,
                    SeatType = actionRequest.SeatType,
                    SeatFee = actionRequest.SeatFee,
                    PaymentMethod = method,
                    CodeTransaction = request.TransactionCode
                });
            }
            else if (actionRequest.ActionType.ToLower() == "baggage")
            {
                await _baggageService.insertBaggage(new BaggageRequestDTO
                {
                    codeTransaction = request.TransactionCode,
                    codeTicket = actionRequest.TicketId,
                    weight = actionRequest.ExtraCheckedKg ?? 0,
                    type = "checked",
                    status = "confirmed"
                });

                if (actionRequest.Amount > 0)
                {
                    int? userId = await _ticketService.GetUserIdByTicketIdAsync(actionRequest.TicketId);
                    if (userId.HasValue && userId.Value >= 51)
                    {
                        int pointsEarned = (int)(actionRequest.Amount / 1000000);
                        if (pointsEarned > 0)
                        {
                            await _ticketService.AddPointsAsync(userId.Value, pointsEarned);
                        }
                    }
                }
            }

            await _paymentRepository.SaveChangesAsync();
            _cache.Remove(cacheKey);

            return new { success = true, message = "Ticket action payment confirmed.", actionType = actionRequest.ActionType };
        }

        public async Task<string> CheckBookingStatusAsync(string bookingRef)
        {
            var booking = await _paymentRepository.GetBookingByCodeAsync(bookingRef);
            if (booking == null)
            {
                var transaction = await _paymentRepository.GetTransactionByCodeAsync(bookingRef);
                if (transaction == null) return "notfound";
                return transaction.sourceBank == "pending" ? "pending" : "confirmed";
            }

            // If all tickets are confirmed, the booking is confirmed
            if (booking.tickets.All(t => t.status == "confirmed"))
            {
                return "confirmed";
            }

            return "pending";
        }

        private static string GetTicketActionCacheKey(string transactionCode) => $"ticket-action:{transactionCode}";

        private static string GenerateTicketActionTransactionCode(string actionType)
        {
            string prefix = actionType == "upgrade" ? "UPG" : "BAG";
            return $"{prefix}_{Guid.NewGuid():N}".Substring(0, 30).ToUpperInvariant();
        }

        private string GetLocalIPAddress()
        {
            try
            {
                // Prioritize operational physical adapters
                foreach (var ni in System.Net.NetworkInformation.NetworkInterface.GetAllNetworkInterfaces())
                {
                    if (ni.OperationalStatus == System.Net.NetworkInformation.OperationalStatus.Up &&
                        ni.NetworkInterfaceType != System.Net.NetworkInformation.NetworkInterfaceType.Loopback &&
                        !ni.Description.ToLower().Contains("virtual") &&
                        !ni.Description.ToLower().Contains("vbox") &&
                        !ni.Description.ToLower().Contains("vmware") &&
                        !ni.Description.ToLower().Contains("wsl") &&
                        !ni.Description.ToLower().Contains("vpn"))
                    {
                        foreach (var ip in ni.GetIPProperties().UnicastAddresses)
                        {
                            if (ip.Address.AddressFamily == System.Net.Sockets.AddressFamily.InterNetwork)
                            {
                                string ipStr = ip.Address.ToString();
                                if (!ipStr.StartsWith("127."))
                                {
                                    return ipStr;
                                }
                            }
                        }
                    }
                }

                // Fallback to DNS lookup if physical adapter scan fails
                var host = Dns.GetHostEntry(Dns.GetHostName());
                foreach (var ip in host.AddressList)
                {
                    if (ip.AddressFamily == AddressFamily.InterNetwork)
                    {
                        string ipStr = ip.ToString();
                        if (ipStr != "127.0.0.1")
                        {
                            return ipStr;
                        }
                    }
                }
            }
            catch (Exception)
            {
                // Fallback to localhost if Dns lookup fails
            }
            return "localhost";
        }

        private async Task<string> GenerateBookingCodeAsync()
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            var random = new Random();
            string code;
            do
            {
                var builder = new System.Text.StringBuilder();
                for (int i = 0; i < 8; i++)
                {
                    builder.Append(chars[random.Next(chars.Length)]);
                }
                code = builder.ToString();
            } while (await _paymentRepository.ExistedCodeBookingAsync(code));
            return code;
        }

        private async Task SendBookingConfirmationEmailAsync(string bookingRef)
        {
            try
            {
                var booking = await _paymentRepository.GetBookingByCodeAsync(bookingRef);
                if (booking == null) return;

                var emails = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
                foreach (var ticket in booking.tickets)
                {
                    if (!string.IsNullOrEmpty(ticket.email))
                    {
                        emails.Add(ticket.email);
                    }
                }
                if (booking.user != null && !string.IsNullOrEmpty(booking.user.email))
                {
                    emails.Add(booking.user.email);
                }

                if (emails.Count == 0) return;

                string ticketsInfoHtml = "";
                foreach (var ticket in booking.tickets)
                {
                    ticketsInfoHtml += $@"
                        <tr style='border-bottom: 1px solid #ddd;'>
                            <td style='padding: 10px;'>{ticket.name}</td>
                            <td style='padding: 10px;'>{ticket.passengerType.ToUpper()}</td>
                            <td style='padding: 10px;'>{ticket.codeSeat ?? "Chưa chọn"}</td>
                            <td style='padding: 10px; text-align: right;'>{ticket.price.ToString("N0")} VND</td>
                        </tr>";
                }

                var firstTicket = booking.tickets.FirstOrDefault();
                string flightInfoHtml = "";
                if (firstTicket != null)
                {
                    var flight = await _flightService.getFlightFromCodeTicket(firstTicket.codeTicket);
                    if (flight != null)
                    {
                        flightInfoHtml = $@"
                            <div style='background-color:#f8f9fa;padding:15px;border-radius:5px;margin:20px 0;border-left: 4px solid #007bff;'>
                                <p style='margin: 5px 0;'><b>Chuyến bay:</b> {flight.flightNumber} ({flight.airline})</p>
                                <p style='margin: 5px 0;'><b>Hành trình:</b> {flight.departureCity} &rarr; {flight.arrivalCity}</p>
                                <p style='margin: 5px 0;'><b>Khởi hành:</b> {firstTicket.departureDate.ToString("dd/MM/yyyy")} lúc {firstTicket.departureTime.ToString("HH:mm")}</p>
                            </div>";
                    }
                }

                string emailBody = $@"
                    <div style='font-family: Arial, sans-serif; line-height:1.8; color:#333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;'>
                        <h2 style='color:#007bff; text-align: center; border-bottom: 2px solid #007bff; padding-bottom: 10px;'>XÁC NHẬN ĐẶT VÉ THÀNH CÔNG</h2>
                        <p>Kính gửi quý khách,</p>
                        <p>Skylines Airlines xin chân thành cảm ơn quý khách đã tin tưởng và sử dụng dịch vụ của chúng tôi. Yêu cầu đặt vé của quý khách đã được thực hiện thành công!</p>
                        
                        <div style='background-color:#e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0;'>
                            <p style='margin: 5px 0; font-size: 16px;'><b>Mã đặt chỗ (Booking Ref):</b> <span style='color: #d9534f; font-size: 20px; font-weight: bold;'>{bookingRef}</span></p>
                            <p style='margin: 5px 0;'><b>Tổng tiền:</b> {booking.bookedPrice.ToString("N0")} VND</p>
                            <p style='margin: 5px 0;'><b>Thời gian đặt:</b> {booking.bookedTime.ToString("dd/MM/yyyy HH:mm:ss")}</p>
                        </div>

                        {flightInfoHtml}

                        <h3>Danh sách hành khách & chi tiết vé:</h3>
                        <table style='width: 100%; border-collapse: collapse;'>
                            <thead>
                                <tr style='background-color: #f8f9fa;'>
                                    <th style='padding: 10px; text-align: left; border-bottom: 2px solid #ddd;'>Hành khách</th>
                                    <th style='padding: 10px; text-align: left; border-bottom: 2px solid #ddd;'>Loại</th>
                                    <th style='padding: 10px; text-align: left; border-bottom: 2px solid #ddd;'>Ghế</th>
                                    <th style='padding: 10px; text-align: right; border-bottom: 2px solid #ddd;'>Giá vé</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ticketsInfoHtml}
                            </tbody>
                        </table>

                        <p style='margin-top: 30px;'>Quý khách vui lòng có mặt tại sân bay ít nhất 2 tiếng trước giờ khởi hành để làm thủ tục check-in.</p>
                        <p>Chúc quý khách có một chuyến bay thượng lộ bình an!</p>
                        <br/>
                        <p>Trân trọng,<br/><b>Skylines Airlines Team</b></p>
                    </div>";

                foreach (var email in emails)
                {
                    await _mailService.SendMail(email, "Xác nhận đặt vé thành công - Skylines Airlines", emailBody);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[EMAIL ERROR] Could not send booking confirmation email for {bookingRef}: {ex.Message}");
            }
        }
    }
}
