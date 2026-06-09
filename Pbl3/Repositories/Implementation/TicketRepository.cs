using Pbl3.DTOs.Bookings;
using Pbl3.Repositories.Interface;
using Pbl3.DataAccess.Data;
using Pbl3.DataAccess.Models.Bookings;
using Pbl3.DataAccess.Models.Flights;
using Pbl3.DataAccess.Models.Payment;
using Pbl3.DataAccess.Models.Users;
using Pbl3.DTOs.Flight;
using Microsoft.EntityFrameworkCore;

namespace Pbl3.Repositories.Implementation
{
    public class TicketRepository : ITicketRepository
    {
        AppDbContext context;
        public TicketRepository(AppDbContext context)
        {
            this.context = context;
        }

        public async Task insertTicket(TicketRequestDTO dto)
        {
            await context.Ticket.AddAsync(new Ticket
            {
                codeTicket = dto.codeTicket,
                codeBooking = dto.codeBooking ?? "",
                codeFlight = dto.codeFlight ?? "",
                codeSeat = dto.codeSeat,
                departureDate = dto.departureDate ?? default,
                departureTime = dto.departureTime ?? default,
                name = dto.name ?? "",
                identityCard = dto.identityCard ?? "",
                email = dto.email ?? "",
                status = dto.state ?? "pending",
                CanSelectSeat = dto.CanSelectSeat ?? false,
                gender = dto.gender ?? "male",
                passengerType = dto.passengerType ?? "adult",
                price = dto.price ?? 0,
                dateOfBirth = dto.dateOfBirth ?? default
            });
            await context.SaveChangesAsync();
        }
        public async Task updateTicket(TicketRequestDTO dto)
        {
            var ticket = await (from t in context.Ticket
                                where dto.codeTicket == t.codeTicket
                                select t).FirstOrDefaultAsync();
            if (ticket != null)
            {
                ticket.codeSeat = dto.codeSeat ?? ticket.codeSeat;
                ticket.departureDate = dto.departureDate ?? ticket.departureDate;
                ticket.departureTime = dto.departureTime ?? ticket.departureTime;
                ticket.name = dto.name ?? ticket.name;
                ticket.identityCard = dto.identityCard ?? ticket.identityCard;
                ticket.CanSelectSeat = dto.CanSelectSeat ?? ticket.CanSelectSeat;
                ticket.status = dto.state ?? "pending";

                if (dto.state == "cancel" || dto.state == "cancelled")
                {
                    // Local helper to process refund and points deduction for a ticket
                    async Task ProcessTicketRefundAndPointsAsync(Ticket tkt)
                    {
                        var booking = await context.Booking
                            .Include(b => b.transaction)
                            .FirstOrDefaultAsync(b => b.codeBooking == tkt.codeBooking);

                        if (booking != null && booking.transaction != null)
                        {
                            // Calculate extra baggage weight and price using getNumberOfCheckedBaggage / getNumberOfCabinBaggage logic
                            var ticketClass = await context.Ticket
                                .Where(t => t.codeTicket == tkt.codeTicket)
                                .Select(t => t.seat.seat.type.name)
                                .FirstOrDefaultAsync() ?? "economy";

                            int freeChecked = (ticketClass == "business") ? 25 : ((ticketClass == "economy") ? 20 : 35);
                            int freeCabin = (ticketClass == "firstClass") ? 12 : ((ticketClass == "business") ? 7 : 0);

                            int checkedWeight = await context.Baggage
                                .Where(b => b.codeTicket == tkt.codeTicket && b.type == "checked" && b.codeTransaction != null)
                                .SumAsync(b => (int?)b.weight) ?? 0;
                            int cabinWeight = await context.Baggage
                                .Where(b => b.codeTicket == tkt.codeTicket && b.type == "cabin" && b.codeTransaction != null)
                                .SumAsync(b => (int?)b.weight) ?? 0;

                            int extraChecked = Math.Max(0, checkedWeight - freeChecked);
                            int extraCabin = Math.Max(0, cabinWeight - freeCabin);
                            decimal extraBaggagePrice = (extraChecked + extraCabin) * 40000;

                            // Create refund transaction
                            var origTxn = booking.transaction;
                            var refundTxnCode = "REFUND_" + tkt.codeTicket + "_" + DateTime.UtcNow.Ticks.ToString();
                            var refundTxn = new Transaction
                            {
                                codeTransaction = refundTxnCode,
                                sourceBank = origTxn.beneficiaryBank,
                                sourceAccount = origTxn.beneficiaryAccount,
                                beneficiaryBank = origTxn.sourceBank,
                                beneficiaryAccount = origTxn.sourceAccount,
                                transactionAmount = (int)Math.Round((tkt.price + extraBaggagePrice) * 0.9m),
                                timeTransaction = DateTime.UtcNow
                            };
                            await context.Transaction.AddAsync(refundTxn);

                            // Deduct points earned
                            if (booking.idUser.HasValue && booking.idUser.Value >= 51)
                            {
                                var passenger = await context.Passenger
                                    .FirstOrDefaultAsync(p => p.id == booking.idUser.Value);
                                if (passenger != null)
                                {
                                    int pointsToDeduct = (int)Math.Floor(tkt.price / 1000000);
                                    passenger.pointReward = Math.Max(0, passenger.pointReward - pointsToDeduct);
                                }
                            }
                        }
                    }

                    // Process refund and points for primary ticket
                    await ProcessTicketRefundAndPointsAsync(ticket);

                    // 1. Release the seat associated with this ticket
                    if (ticket.codeSeat != null)
                    {
                        var flightSeat = await context.FlightSeat
                            .FirstOrDefaultAsync(fs => fs.codeFlight == ticket.codeFlight &&
                                                       fs.departureDate == ticket.departureDate &&
                                                       fs.departureTime == ticket.departureTime &&
                                                       fs.codeSeat == ticket.codeSeat);
                        if (flightSeat != null)
                        {
                            flightSeat.isBooked = false;
                        }
                    }

                    // 2. Remove all baggage associated with this ticket
                    var baggages = await context.Baggage.Where(b => b.codeTicket == ticket.codeTicket).ToListAsync();
                    context.Baggage.RemoveRange(baggages);

                    // 3. Check and cancel the other ticket in RoundTickets if it exists
                    var roundTicket = await context.RoundTickets
                        .FirstOrDefaultAsync(rt => rt.codeTicket == ticket.codeTicket || rt.returnCodeTicket == ticket.codeTicket);

                    if (roundTicket != null)
                    {
                        string otherTicketId = roundTicket.codeTicket == ticket.codeTicket 
                            ? roundTicket.returnCodeTicket 
                            : roundTicket.codeTicket;

                        var otherTicket = await context.Ticket
                            .FirstOrDefaultAsync(t => t.codeTicket == otherTicketId);

                        if (otherTicket != null && otherTicket.status != "cancel" && otherTicket.status != "cancelled")
                        {
                            // Process refund and points for return ticket
                            await ProcessTicketRefundAndPointsAsync(otherTicket);

                            otherTicket.status = dto.state;

                            if (otherTicket.codeSeat != null)
                            {
                                var otherFlightSeat = await context.FlightSeat
                                    .FirstOrDefaultAsync(fs => fs.codeFlight == otherTicket.codeFlight &&
                                                               fs.departureDate == otherTicket.departureDate &&
                                                               fs.departureTime == otherTicket.departureTime &&
                                                               fs.codeSeat == otherTicket.codeSeat);
                                if (otherFlightSeat != null)
                                {
                                    otherFlightSeat.isBooked = false;
                                }
                            }

                            var otherBaggages = await context.Baggage.Where(b => b.codeTicket == otherTicket.codeTicket).ToListAsync();
                            context.Baggage.RemoveRange(otherBaggages);
                        }
                    }
                }

                await context.SaveChangesAsync();
            }
        }
        public async Task deleteTicket(TicketRequestDTO dto)
        {
            var ticket = await (from t in context.Ticket
                                where dto.codeTicket == t.codeTicket
                                select t).FirstOrDefaultAsync();
            if (ticket != null)
            {
                // Release seat before deleting
                if (ticket.codeSeat != null)
                {
                    var flightSeat = await context.FlightSeat
                        .FirstOrDefaultAsync(fs => fs.codeFlight == ticket.codeFlight &&
                                                   fs.departureDate == ticket.departureDate &&
                                                   fs.departureTime == ticket.departureTime &&
                                                   fs.codeSeat == ticket.codeSeat);
                    if (flightSeat != null)
                    {
                        flightSeat.isBooked = false;
                    }
                }
                context.Ticket.Remove(ticket);
                await context.SaveChangesAsync();
            }
        }
        public async Task<TicketResponseDTO> getTicket(string codeTicket)
        {
            var ticket = await (from t in context.Ticket
                                where codeTicket == t.codeTicket
                                select new TicketResponseDTO
                                {
                                    id = t.codeTicket,
                                    bookingRef = t.codeBooking,
                                    status = t.status,
                                    seatNumber = t.codeSeat?? "",
                                    passengerName = t.name,
                                    passengerEmail = t.email,
                                    price = t.price,
                                    ticketClass = t.seat.seat.type.name,
                                    isCancelled = t.status == "confirmed" && (t.request == null || t.request.status == "rejected"),
                                    isUpgraded = t.status == "confirmed" && t.seat.seat.type.name != "firstClass" && (t.request == null || t.request.status == "rejected"),
                                }).FirstOrDefaultAsync();
            return ticket;

        }
        public async Task<List<TicketDTO>> getTicketByBookingCode(string codeBooking)
        {
            var tickets = await (from t in context.Ticket
                                 where codeBooking == t.codeBooking
                                 select new TicketDTO
                                 {
                                     id = t.codeTicket,
                                     bookingRef = t.codeBooking,
                                     bookedAt = t.booking.bookedTime.ToString("yyyy-MM-ddTHH:mm:ss"),
                                     totalPrice = t.price,
                                     status = t.status,
                                     seatNumber = t.codeSeat,
                                     passengerName = t.name,
                                     passengerEmail = t.email,
                                     ticketClass = t.seat.seat.type.name,
                                     price = t.price,
                                     isCancelled = t.status == "confirmed" && (t.request == null || t.request.status == "rejected"),
                                     isUpgraded = t.status == "confirmed" && t.seat.seat.type.name != "firstClass" && (t.request == null || t.request.status == "rejected"),
                                 }).ToListAsync();
            return tickets;
        }
        public async Task<int> getNumberOfTicketByCode(string code)
        {
            var number = await (from t in context.Ticket
                                where code == t.codeTicket.Substring(0, 14)
                                select t).CountAsync();
            return number;
        }
        public async Task<BaggageApiDTO> getBaggageByTickets(string codeTicket)
        {
            var bs = await (from b in context.Baggage
                            where b.codeTicket == codeTicket
                            select b).ToListAsync();
            BaggageApiDTO dto = new BaggageApiDTO();
            dto.cabin = 0;
            dto.@checked = 0;
            foreach (var b in bs)
            {
                if (b.type == "cabin") dto.cabin++;
                else dto.@checked++;
            }
            return dto;
        }
        public async Task<List<TicketDTO>> getTickets(int id)
        {
            var tickets = await (from t in context.Ticket
                                 where id == t.booking.idUser
                                 select new TicketDTO
                                 {
                                     id = t.codeTicket,
                                     bookingRef = t.codeBooking,
                                     bookedAt = t.booking.bookedTime.ToString("yyyy-MM-ddTHH:mm:ss"),
                                     totalPrice = t.price,
                                     status = t.status,
                                     seatNumber = t.codeSeat,
                                     passengerName = t.name,
                                     passengerEmail = t.email,
                                     ticketClass = t.seat.seat.type.name,
                                     price = t.price,
                                     isCancelled = t.status == "confirmed" && (t.request == null || t.request.status == "rejected"),
                                     isUpgraded = t.status == "confirmed" && t.seat.seat.type.name != "firstClass" && (t.request == null || t.request.status == "rejected"),
                                 }).ToListAsync();
            return tickets;
        }
        public async Task<List<TicketDTO>> getAllTickets()
        {
            var tickets = await (from t in context.Ticket
                                 select new TicketDTO
                                 {
                                     id = t.codeTicket,
                                     bookingRef = t.codeBooking,
                                     bookedAt = t.booking.bookedTime.ToString("yyyy-MM-ddTHH:mm:ss"),
                                     totalPrice = t.price,
                                     status = t.status,
                                     seatNumber = t.codeSeat,
                                     passengerName = t.name,
                                     passengerEmail = t.email,
                                     ticketClass = t.seat.seat.type.name,
                                     price = t.price,
                                     isCancelled = t.status == "confirmed" && (t.request == null || t.request.status == "rejected"),
                                     isUpgraded = t.status == "confirmed" && t.seat.seat.type.name != "firstClass" && (t.request == null || t.request.status == "rejected"),
                                 }).ToListAsync();
            return tickets;
        }

        public async Task UpgradeTicketAsync(string ticketId, string newClass, string? seatNumber, decimal upgradeFee, decimal seatFee)
        {
            // 1. Get ticket
            var ticket = await context.Ticket
                .Include(t => t.seat)
                .FirstOrDefaultAsync(t => t.codeTicket == ticketId);

            if (ticket == null) throw new KeyNotFoundException("Ticket not found");

            // 2. Release old seat
            if (ticket.codeSeat != null)
            {
                var oldFlightSeat = await context.FlightSeat
                    .FirstOrDefaultAsync(fs => fs.codeFlight == ticket.codeFlight &&
                                               fs.departureDate == ticket.departureDate &&
                                               fs.departureTime == ticket.departureTime &&
                                               fs.codeSeat == ticket.codeSeat);
                if (oldFlightSeat != null)
                {
                    oldFlightSeat.isBooked = false;
                }
            }

            // 3. Reserve new seat
            string targetSeat = seatNumber;
            if (string.IsNullOrEmpty(targetSeat))
            {
                var availableSeat = await context.FlightSeat
                    .Include(fs => fs.seat)
                    .Where(fs => fs.codeFlight == ticket.codeFlight &&
                                 fs.departureDate == ticket.departureDate &&
                                 fs.departureTime == ticket.departureTime &&
                                 !fs.isBooked &&
                                 fs.seat.type.name == newClass)
                    .FirstOrDefaultAsync();

                if (availableSeat == null)
                {
                    throw new InvalidOperationException($"No seats available in class {newClass}");
                }
                targetSeat = availableSeat.codeSeat;
            }

            var newFlightSeat = await context.FlightSeat
                .FirstOrDefaultAsync(fs => fs.codeFlight == ticket.codeFlight &&
                                           fs.departureDate == ticket.departureDate &&
                                           fs.departureTime == ticket.departureTime &&
                                           fs.codeSeat == targetSeat);

            if (newFlightSeat == null)
            {
                throw new KeyNotFoundException($"Seat {targetSeat} not found on this flight");
            }

            newFlightSeat.isBooked = true;

            // 4. Update ticket details
            ticket.codeSeat = targetSeat;
            ticket.price += (upgradeFee + seatFee);

            await context.SaveChangesAsync();
        }

        public async Task insertRoadTickets(string codeTicket, string returnCodeTicket)
        {
            await context.RoundTickets.AddAsync(new RoundTickets
            {
                codeTicket = codeTicket,
                returnCodeTicket = returnCodeTicket
            });
            await context.SaveChangesAsync();
        }

        public async Task<List<RoundTickets>> getRoundTickets()
        {
            return await context.RoundTickets.ToListAsync();
        }

        public async Task<int?> GetUserIdByTicketIdAsync(string ticketId)
        {
            var ticket = await context.Ticket
                .Include(t => t.booking)
                .FirstOrDefaultAsync(t => t.codeTicket == ticketId);
            return ticket?.booking?.idUser;
        }

        public async Task AddPointsAsync(int userId, int points)
        {
            var passenger = await context.Passenger.FirstOrDefaultAsync(p => p.id == userId);
            if (passenger != null)
            {
                passenger.pointReward += points;
                await context.SaveChangesAsync();
            }
        }
    }
}
