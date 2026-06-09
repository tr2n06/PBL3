using Pbl3.DTOs.Flight;
using Pbl3.DTOs.Others;
using Pbl3.DTOs.Bookings;
using Pbl3.Services.Interface;
using Pbl3.Repositories.Interface;
using Pbl3.Repositories.Implementation;

namespace Pbl3.Services.Implementation
{
    public class FlightService : IFlightService
    {
        private readonly IFlightRepository repository;
        public FlightService(IFlightRepository repository)
        {
            this.repository = repository;
        }

        public async Task insertFlight(CreateFlightDTO dto)
        {
            var targetFlightNumber = dto.flightNumber;
            var targetDepartureDate = DateOnly.Parse(dto.departureDate);
            var targetDepartureTime = TimeOnly.Parse(dto.departureTime);
            var targetArrivalDate = DateOnly.Parse(dto.arrivalDate);
            var targetArrivalTime = TimeOnly.Parse(dto.arrivalTime);

            FlightDTO? flight = null;
            do
            {
                try
                {
                    flight = await repository.getFlight(new FlightSearchDTO
                    {
                        codeFlight = targetFlightNumber,
                        departureDate = targetDepartureDate,
                        departureTime = targetDepartureTime
                    });
                }
                catch (Exception ex) when (ex.Message.Contains("Can't find this flight"))
                {
                    flight = null;
                }

                if (flight != null)
                {
                    // Delay departure by 5 minutes
                    var newDepartureTime = targetDepartureTime.AddMinutes(5);
                    if (newDepartureTime < targetDepartureTime)
                    {
                        targetDepartureDate = targetDepartureDate.AddDays(1);
                    }
                    targetDepartureTime = newDepartureTime;

                    // Delay arrival by 5 minutes to maintain exact duration
                    var newArrivalTime = targetArrivalTime.AddMinutes(5);
                    if (newArrivalTime < targetArrivalTime)
                    {
                        targetArrivalDate = targetArrivalDate.AddDays(1);
                    }
                    targetArrivalTime = newArrivalTime;
                }
            }
            while (flight != null);

            dto.departureDate = targetDepartureDate.ToString("yyyy-MM-dd");
            dto.departureTime = targetDepartureTime.ToString("HH:mm:ss");
            dto.arrivalDate = targetArrivalDate.ToString("yyyy-MM-dd");
            dto.arrivalTime = targetArrivalTime.ToString("HH:mm:ss");

            var currentDate = DateOnly.FromDateTime(DateTime.Now);
            var InformationDetail = await repository.getInformationDetail(dto);
            int day = this.day(targetArrivalDate);
            double index = 0;
            if (day == 5 || day == 6)
            {
                index = 1.2;
            }
            else
            {
                index = 1.5;
            }
            // 1200 đồng/km, phụ phí 200k
            dto.price = (int)(1200 * index * InformationDetail.length) + 200000;
            try
            {
                await repository.insertFlight(dto);
                await this.insertSeatFlight(dto);
            }
            catch (Exception ex)
            {
                throw new Exception("Internal server error: " + ex.Message);
            }
        }
        public async Task insertDiscountFlight(LowBookingDTORequest dto)
        {
            var flight = await repository.getFlight(new FlightSearchDTO
            {
                codeFlight = dto.codeFlight,
                departureDate = DateOnly.Parse(dto.departureDate),
                departureTime = TimeOnly.Parse(dto.departureTime)
            });
            if (flight == null) throw new Exception("Flight not found");
            try
            {
                if (dto.discount <= 0 || dto.discount >= 100) throw new Exception("Invalid discount");
                await repository.insertDiscountFlight(dto);
            }
            catch (Exception ex)
            {
                throw new Exception("Internal server error: " + ex.Message);
            }
        }
        public async Task updateFlight(string flightId, UpdateFlightDTO dto)
        {
            var key = await this.getKeyFromId(flightId);

            var targetFlightNumber = dto.flightNumber ?? key.codeFlight;
            var targetDepartureDate = dto.departureDate != null ? DateOnly.Parse(dto.departureDate) : key.departureDate.Value;
            var targetDepartureTime = dto.departureTime != null ? TimeOnly.Parse(dto.departureTime) : key.departureTime.Value;

            FlightDTO? flight = null;
            do
            {
                try
                {
                    flight = await repository.getFlight(new FlightSearchDTO
                    {
                        codeFlight = targetFlightNumber,
                        departureDate = targetDepartureDate,
                        departureTime = targetDepartureTime
                    });
                }
                catch (Exception ex) when (ex.Message.Contains("Can't find this flight"))
                {
                    flight = null;
                }

                if (flight != null)
                {
                    // Check if the found flight is the current flight we are updating
                    if (targetFlightNumber == key.codeFlight &&
                        targetDepartureDate == key.departureDate.Value &&
                        targetDepartureTime == key.departureTime.Value)
                    {
                        break;
                    }

                    var newTime = targetDepartureTime.AddMinutes(5);
                    if (newTime < targetDepartureTime)
                    {
                        targetDepartureDate = targetDepartureDate.AddDays(1);
                    }
                    targetDepartureTime = newTime;
                }

            }
            while (flight != null);
            try
            {
                dto.flightNumber = targetFlightNumber;
                dto.departureDate = targetDepartureDate.ToString("yyyy-MM-dd");
                dto.departureTime = targetDepartureTime.ToString("HH:mm:ss");
                await repository.updateFlight(dto, key);
            }
            catch (Exception ex)
            {
                throw new Exception("Internal server error: " + ex.Message);
            }
        }
        public async Task<FlightDTO> getFlight(FlightSearchDTO dto)
        {
            try
            {
                var flight = await repository.getFlight(dto);
                flight.price.business += (await repository.getTicketType(1))?.priceBooked ?? 0;
                flight.price.economy += (await repository.getTicketType(2))?.priceBooked ?? 0;
                flight.price.firstClass += (await repository.getTicketType(3))?.priceBooked ?? 0;
                //dto.departureDate = DateOnly.ParseExact(flight.arrival.date, "dd/MM/yyyy", null);
                var discount = await repository.getDiscountFlight(dto);
                if (discount != null)
                {
                    flight.price.business = flight.price.business * (1 - (discount.discount ?? 0) / 100m);

                    flight.price.economy = flight.price.economy * (1 - (discount.discount ?? 0) / 100m);

                    flight.price.firstClass = flight.price.firstClass * (1 - (discount.discount ?? 0) / 100m);
                }
                flight.discount = discount?.discount ?? 0;

                var detailFlight = await repository.getFlightDetail(dto);
                flight.departure.city = detailFlight.departure.city;
                flight.departure.code = detailFlight.departure.code;
                flight.departure.airport = detailFlight.departure.airport;
                flight.arrival.city = detailFlight.arrival.city;
                flight.arrival.code = detailFlight.arrival.code;
                flight.arrival.airport = detailFlight.arrival.airport;

                var seats = await repository.getAvailableSeatFlight(dto);
                flight.seatsAvailable = new SeatAvailableDTO();
                foreach (var seat in seats)
                {
                    if (seat.codeType == 2) flight.seatsAvailable.economy++;
                    else if (seat.codeType == 1) flight.seatsAvailable.business++;
                    else if (seat.codeType == 3) flight.seatsAvailable.firstClass++;
                }

                var selectedseats = await repository.getSelectedSeatFlight(dto);
                flight.hasBookings = selectedseats.Count > 0;
                flight.bookedCount = selectedseats.Count;
                flight.airline = "Skylines";

                
                

                TimeSpan duration = DateOnly.Parse(flight.arrival.date).ToDateTime(TimeOnly.Parse(flight.arrival.time)) - DateOnly.Parse(flight.departure.date).ToDateTime(TimeOnly.Parse(flight.departure.time));
                flight.duration = duration.ToString(@"hh\:mm\:ss");

                return flight;
            }
            catch (Exception ex)
            {
                throw new Exception("Internal server error: " + ex.Message);
            }
        }
        public async Task<List<FlightDTO>> getFlights(FlightSearchDTO dto)
        {
            try
            {
                var flights = await repository.getFlights(dto);
                foreach (var flight in flights)
                {
                    flight.price.business += (await repository.getTicketType(1))?.priceBooked ?? 0;
                    flight.price.economy += (await repository.getTicketType(2))?.priceBooked ?? 0;
                    flight.price.firstClass += (await repository.getTicketType(3))?.priceBooked ?? 0;
                    dto.departureDate = DateOnly.Parse(flight.departure.date);
                    dto.departureTime = TimeOnly.Parse(flight.departure.time);
                    var discount = await repository.getDiscountFlight(dto);
                    if (discount != null)
                    {
                        flight.price.business = flight.price.business * (1 - (discount.discount ?? 0) / 100m);

                        flight.price.economy = flight.price.economy * (1 - (discount.discount ?? 0) / 100m);

                        flight.price.firstClass = flight.price.firstClass * (1 - (discount.discount ?? 0) / 100m);
                    }
                    flight.discount = discount?.discount ?? 0;

                    var detailFlight = await repository.getFlightDetail(dto);
                    flight.arrival.city = detailFlight.arrival.city;
                    flight.arrival.code = detailFlight.arrival.code;
                    flight.arrival.airport = detailFlight.arrival.airport;
                    flight.departure.city = detailFlight.departure.city;
                    flight.departure.code = detailFlight.departure.code;
                    flight.departure.airport = detailFlight.departure.airport;

                    var seats = await repository.getAvailableSeatFlight(dto);
                    flight.seatsAvailable = new SeatAvailableDTO();
                    foreach (var seat in seats)
                    {
                        if (seat.codeType == 2) flight.seatsAvailable.economy++;
                        else if (seat.codeType == 1) flight.seatsAvailable.business++;
                        else if (seat.codeType == 3) flight.seatsAvailable.firstClass++;
                    }

                    var selectedseats = await repository.getSelectedSeatFlight(dto);
                    flight.hasBookings = selectedseats.Count > 0;
                    flight.bookedCount = selectedseats.Count;
                    flight.airline = "Skylines";

                    
                    

                    TimeSpan duration = DateOnly.Parse(flight.arrival.date).ToDateTime(TimeOnly.Parse(flight.arrival.time)) - DateOnly.Parse(flight.departure.date).ToDateTime(TimeOnly.Parse(flight.departure.time));
                    flight.duration = duration.ToString(@"hh\:mm\:ss");
                }
                return flights;
            }
            catch (Exception ex)
            {
                throw new Exception("Internal server error: " + ex.Message);
            }
        }
        public async Task<List<FlightDTO>> getAllFlights()
        {
            try
            {
                var flights = await repository.getAllFlights();
                foreach (var flight in flights)
                {
                    FlightSearchDTO dto = new FlightSearchDTO
                    {
                        codeFlight = flight.flightNumber,
                        departureDate = DateOnly.Parse(flight.departure.date),
                        departureTime = TimeOnly.Parse(flight.departure.time)
                    };
                    flight.price.business += (await repository.getTicketType(1))?.priceBooked ?? 0;
                    flight.price.economy += (await repository.getTicketType(2))?.priceBooked ?? 0;
                    flight.price.firstClass += (await repository.getTicketType(3))?.priceBooked ?? 0;
                    var discount = await repository.getDiscountFlight(dto);
                    if (discount != null)
                    {
                        flight.price.business = flight.price.business * (1 - (discount.discount ?? 0) / 100m);

                        flight.price.economy = flight.price.economy * (1 - (discount.discount ?? 0) / 100m);

                        flight.price.firstClass = flight.price.firstClass * (1 - (discount.discount ?? 0) / 100m);
                    }
                    flight.discount = discount?.discount ?? 0;

                    var detailFlight = await repository.getFlightDetail(dto);
                    flight.departure.city = detailFlight.departure.city;
                    flight.departure.code = detailFlight.departure.code;
                    flight.departure.airport = detailFlight.departure.airport;
                    flight.arrival.city = detailFlight.arrival.city;
                    flight.arrival.code = detailFlight.arrival.code;
                    flight.arrival.airport = detailFlight.arrival.airport;

                    var seats = await repository.getAvailableSeatFlight(dto);
                    flight.seatsAvailable = new SeatAvailableDTO();
                    foreach (var seat in seats)
                    {
                        if (seat.codeType == 2) flight.seatsAvailable.economy++;
                        else if (seat.codeType == 1) flight.seatsAvailable.business++;
                        else if (seat.codeType == 3) flight.seatsAvailable.firstClass++;
                    }

                    var selectedseats = await repository.getSelectedSeatFlight(dto);
                    flight.hasBookings = selectedseats.Count > 0;
                    flight.bookedCount = selectedseats.Count;
                    flight.airline = "Skylines";

                    

                    TimeSpan duration = DateOnly.Parse(flight.arrival.date).ToDateTime(TimeOnly.Parse(flight.arrival.time)) - DateOnly.Parse(flight.departure.date).ToDateTime(TimeOnly.Parse(flight.departure.time));
                    flight.duration = duration.ToString(@"hh\:mm\:ss");
                }
                return flights;
            }
            catch (Exception ex)
            {
                throw new Exception("Internal server error: " + ex.Message);
            }
        }
        public async Task<List<FlightSearchResponseDTO>> SearchFlights(FlightSearchRequestDTO dto)
        {
            try
            {
                List<FlightSearchResponseDTO> flightSearchs = new List<FlightSearchResponseDTO>();
                var detailInformation = await repository.getInformationDetail(new CreateFlightDTO
                {
                    departureCode = dto.from,
                    arrivalCode = dto.to
                });
                Console.WriteLine(detailInformation.codeFlight);
                var flights = await repository.getFlights(new FlightSearchDTO
                {
                    codeFlight = detailInformation.codeFlight,
                    departureDate = DateOnly.Parse(dto.departDate),
                });
                foreach (var flight in flights)
                {
                    flight.price.business += (await repository.getTicketType(1))?.priceBooked ?? 0;
                    flight.price.economy += (await repository.getTicketType(2))?.priceBooked ?? 0;
                    flight.price.firstClass += (await repository.getTicketType(3))?.priceBooked ?? 0;
                    var discount = await repository.getDiscountFlight(new FlightSearchDTO
                    {
                        codeFlight = flight.flightNumber,
                        departureDate = DateOnly.Parse(flight.departure.date),
                        departureTime = TimeOnly.Parse(flight.departure.time)
                    });
                    if (discount != null)
                    {
                        flight.price.business = flight.price.business * (1 - (discount.discount ?? 0) / 100m);

                        flight.price.economy = flight.price.economy * (1 - (discount.discount ?? 0) / 100m);

                        flight.price.firstClass = flight.price.firstClass * (1 - (discount.discount ?? 0) / 100m);
                    }
                    flight.discount = discount?.discount ?? 0;

                    var detailFlight = await repository.getFlightDetail(new FlightSearchDTO
                    {
                        codeFlight = flight.flightNumber,
                        departureDate = DateOnly.Parse(flight.departure.date),
                        departureTime = TimeOnly.Parse(flight.departure.time)
                    });
                    flight.departure.city = detailFlight.departure.city;
                    flight.departure.code = detailFlight.departure.code;
                    flight.departure.airport = detailFlight.departure.airport;
                    flight.arrival.city = detailFlight.arrival.city;
                    flight.arrival.code = detailFlight.arrival.code;
                    flight.arrival.airport = detailFlight.arrival.airport;

                    var seats = await repository.getAvailableSeatFlight(new FlightSearchDTO
                    {
                        codeFlight = flight.flightNumber,
                        departureDate = DateOnly.Parse(flight.departure.date),
                        departureTime = TimeOnly.Parse(flight.departure.time)
                    });
                    flight.seatsAvailable = new SeatAvailableDTO();
                    foreach (var seat in seats)
                    {
                        if (seat.codeType == 2) flight.seatsAvailable.economy++;
                        else if (seat.codeType == 1) flight.seatsAvailable.business++;
                        else if (seat.codeType == 3) flight.seatsAvailable.firstClass++;
                    }

                    var selectedseats = await repository.getSelectedSeatFlight(new FlightSearchDTO
                    {
                        codeFlight = flight.flightNumber,
                        departureDate = DateOnly.Parse(flight.departure.date),
                        departureTime = TimeOnly.Parse(flight.departure.time)
                    });
                    flight.hasBookings = selectedseats.Count > 0;
                    flight.bookedCount = selectedseats.Count;

                    TimeSpan duration = DateOnly.Parse(flight.arrival.date).ToDateTime(TimeOnly.Parse(flight.arrival.time)) - DateOnly.Parse(flight.departure.date).ToDateTime(TimeOnly.Parse(flight.departure.time));
                    flight.duration = duration.ToString(@"hh\:mm\:ss");

                    
                    

                    int requiredSeats = dto.adults + dto.children;
                    if (requiredSeats <= 0)
                    {
                        requiredSeats = dto.passengers - dto.infants;
                    }
                    if (requiredSeats <= 0)
                    {
                        requiredSeats = 1;
                    }

                    if (requiredSeats <= flight.seatsAvailable.economy || requiredSeats <= flight.seatsAvailable.business || requiredSeats <= flight.seatsAvailable.firstClass)
                    {
                        FlightSearchResponseDTO responseDTO = new FlightSearchResponseDTO
                        {
                            id = flight.id,
                            flightNumber = flight.flightNumber,
                            airline = "Skylines",
                            arrivalCode = flight.arrival.code,
                            arrivalCity = flight.arrival.city,
                            arrivalAirport = flight.arrival.airport,
                            arrivalTime = flight.arrival.time,
                            arrivalDate = flight.arrival.date,
                            departureCode = flight.departure.code,
                            departureCity = flight.departure.city,
                            departureAirport = flight.departure.airport,
                            departureTime = flight.departure.time,
                            departureDate = flight.departure.date,
                            duration = flight.duration,
                            economyPrice = flight.price.economy,
                            businessPrice = flight.price.business,
                            firstClassPrice = flight.price.firstClass,
                            economySeats = flight.seatsAvailable.economy,
                            businessSeats = flight.seatsAvailable.business,
                            firstClassSeats = flight.seatsAvailable.firstClass,
                            discount = flight.discount,
                            isPromotion = flight.isPromotion,
                        };
                        flightSearchs.Add(responseDTO);
                    }
                }
                return flightSearchs;
            }
            catch (Exception ex)
            {
                throw new Exception("Internal server error: " + ex.Message);
            }
        }
        public async Task<List<RoundFlightSearchResponseDTO>> GetRoundFlights(FlightSearchRequestDTO dto)
        {
            try
            {
                var departFlights = await SearchFlights(dto);

                var returnRequest = new FlightSearchRequestDTO
                {
                    from = dto.to,
                    to = dto.from,
                    departDate = dto.returnDate,
                    returnDate = null,
                    tripType = "oneway",
                    passengers = dto.passengers,
                    adults = dto.adults,
                    children = dto.children,
                    infants = dto.infants
                };
                var returnFlights = await SearchFlights(returnRequest);

                if (departFlights.Count == 0 || returnFlights.Count == 0)
                {
                    throw new Exception("No valid flights found for the selected dates.");
                }

                var roundFlights = new List<RoundFlightSearchResponseDTO>();
                foreach (var dep in departFlights)
                {
                    foreach (var arr in returnFlights)
                    {
                        var depClone = new FlightSearchResponseDTO
                        {
                            id = dep.id,
                            flightNumber = dep.flightNumber,
                            airline = dep.airline,
                            duration = dep.duration,
                            arrivalCode = dep.arrivalCode,
                            arrivalCity = dep.arrivalCity,
                            arrivalAirport = dep.arrivalAirport,
                            arrivalTime = dep.arrivalTime,
                            arrivalDate = dep.arrivalDate,
                            departureCode = dep.departureCode,
                            departureCity = dep.departureCity,
                            departureAirport = dep.departureAirport,
                            departureTime = dep.departureTime,
                            departureDate = dep.departureDate,
                            economyPrice = Math.Round(dep.economyPrice * 0.9m),
                            businessPrice = Math.Round(dep.businessPrice * 0.9m),
                            firstClassPrice = Math.Round(dep.firstClassPrice * 0.9m),
                            economySeats = dep.economySeats,
                            businessSeats = dep.businessSeats,
                            firstClassSeats = dep.firstClassSeats,
                            status = dep.status,
                            discount = dep.discount,
                            isPromotion = dep.isPromotion
                        };

                        var arrClone = new FlightSearchResponseDTO
                        {
                            id = arr.id,
                            flightNumber = arr.flightNumber,
                            airline = arr.airline,
                            duration = arr.duration,
                            arrivalCode = arr.arrivalCode,
                            arrivalCity = arr.arrivalCity,
                            arrivalAirport = arr.arrivalAirport,
                            arrivalTime = arr.arrivalTime,
                            arrivalDate = arr.arrivalDate,
                            departureCode = arr.departureCode,
                            departureCity = arr.departureCity,
                            departureAirport = arr.departureAirport,
                            departureTime = arr.departureTime,
                            departureDate = arr.departureDate,
                            economyPrice = Math.Round(arr.economyPrice * 0.9m),
                            businessPrice = Math.Round(arr.businessPrice * 0.9m),
                            firstClassPrice = Math.Round(arr.firstClassPrice * 0.9m),
                            economySeats = arr.economySeats,
                            businessSeats = arr.businessSeats,
                            firstClassSeats = arr.firstClassSeats,
                            status = arr.status,
                            discount = arr.discount,
                            isPromotion = arr.isPromotion
                        };

                        int requiredSeats = dto.adults + dto.children;
                        if (requiredSeats <= 0)
                        {
                            requiredSeats = dto.passengers - dto.infants;
                        }
                        if (requiredSeats <= 0)
                        {
                            requiredSeats = 1;
                        }

                        bool hasCommonClass = (dep.economySeats >= requiredSeats && arr.economySeats >= requiredSeats) ||
                                              (dep.businessSeats >= requiredSeats && arr.businessSeats >= requiredSeats) ||
                                              (dep.firstClassSeats >= requiredSeats && arr.firstClassSeats >= requiredSeats);

                        if (!hasCommonClass)
                        {
                            continue;
                        }

                        roundFlights.Add(new RoundFlightSearchResponseDTO
                        {
                            departure = depClone,
                            arrival = arrClone
                        });
                    }
                }
                return roundFlights;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
        public async Task deleteFlight(FlightSearchDTO dto)
        {
            try
            {
                ;
                var isExist = await repository.haveTicket(dto);
                if (isExist)
                {
                    throw new Exception("Cannot delete flight with existing bookings");
                }
                await repository.deleteFlight(dto);
            }
            catch (Exception ex)
            {
                throw new Exception("Internal server error: " + ex.Message);
            }
        }
        public async Task deleteDiscountFlight(FlightSearchDTO dto)
        {
            try
            {
                await repository.deleteDiscountFlight(dto);
            }
            catch (Exception ex)
            {
                throw new Exception("Internal server error: " + ex.Message);
            }
        }
        public async Task insertRequest(LowBookingDTORequest dto)
        {
            try
            {
                if (dto.discount <= 0 || dto.discount >= 100) throw new Exception("Invalid discount");
                await repository.insertRequest(dto);
            }
            catch (Exception ex)
            {
                throw new Exception("Internal server error: " + ex.Message);
            }
        }
        public async Task<List<LowBookingDTOResponse>> getRequestsById(int account_id)
        {
            return await repository.getRequestById(account_id);
        }
        public async Task updateRequest(LowBookingDTORequest dto)
        {
            if (dto == null) return;
            try
            {
                if (dto.discount <= 0 || dto.discount >= 100) throw new Exception("Invalid discount");
                await repository.updateRequest(dto);
            }
            catch (Exception ex)
            {
                throw new Exception("Internal server error: " + ex.Message);
            }
        }
        public async Task deleteRequest(LowBookingDTORequest dto)
        {
            try
            {
                await repository.deleteRequest(dto);
            }
            catch (Exception ex)
            {
                throw new Exception("Internal server error: " + ex.Message);
            }
        }
        public async Task insertSeatFlight(CreateFlightDTO dto)
        {
            try
            {
                var seats = await repository.getAllSeats();
                foreach (var seat in seats)
                {
                    var type = await repository.getTypeSeat(seat);
                    await repository.insertSeatFlight(new SeatSelectionDTO
                    {
                        codeSeat = seat,
                        codeFlight = dto.flightNumber ?? "",
                        departureDate = DateOnly.Parse(dto.departureDate),
                        departureTime = TimeOnly.Parse(dto.departureTime),
                        codeType = type,
                        isBooked = false
                    });
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Internal server error: " + ex.Message);
            }

        }
        public async Task updateSeatFlight(SeatSelectionDTO dto)
        {
            try
            {
                await repository.updateSeatFlight(dto);
            }
            catch (Exception ex)
            {
                throw new Exception("Internal server error: " + ex.Message);
            }
        }
        // public async Task deleteSeatFlight(FlightSearchDTO dto) // xóa ghế khi hủy chuyến bay
        // {
        //     await repository.deleteSeatFlight(dto);
        // }
        public async Task<List<SeatSelectionDTO>> getAvailableSeatFlight(FlightSearchDTO dto)
        {
            try
            {
                return await repository.getAvailableSeatFlight(dto);
            }
            catch (Exception ex)
            {
                throw new Exception("Internal server error: " + ex.Message);
            }
        }
        public async Task<FlightSearchDTO> getKeyFromId(string flightId)
        {
            try
            {
                string[] parts = flightId.Split('-');

                string code = parts[0];
                DateOnly date = DateOnly.ParseExact(parts[1], "ddMMyyyy");
                TimeOnly time = TimeOnly.ParseExact(parts[2], "HHmmss");
                return new FlightSearchDTO
                {
                    codeFlight = code,
                    departureDate = date,
                    departureTime = time
                };
            }
            catch (Exception ex)
            {
                throw new Exception("Internal server error: " + ex.Message);
            }
        }

        public async Task<FlightApiDTO> getFlightFromCodeTicket(string codeTicket)
        {
            try
            {
                return await repository.getFlightFromCodeTicket(codeTicket);
            }
            catch (Exception e)
            {
                Console.WriteLine("Lỗi: " + e.ToString());
                throw new Exception("Not existed flight");
            }
        }
        public async Task<List<PassengerFlightDTO>> getPassengerFlight(FlightSearchDTO dto)
        {
            return await repository.getPassengerFlight(dto);
        }
        public async Task<string> getFlightNumber(string departureCode, string arrivalCode) {
            try {
                return await repository.getFlightNumber(departureCode, arrivalCode);
            }
            catch (Exception ex) {
                throw new Exception("Internal server error: " + ex.Message);
            }
        }
        private int day(DateOnly date)
        {
            int[] dayInMonth = { 0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 };
            //01/01/2026 -> thứ 5-> 3
            int difference = 0;
            for (int i = date.Year; i > 2026; i--)
            {
                difference += 365;
                if (isLeapYear(i - 1)) difference++;
            }
            if (this.isLeapYear(date.Year) && date.Month > 2) difference++;
            difference += date.Day - 1;
            for (int i = date.Month; i > 1; i--)
            {
                difference += dayInMonth[i - 1];
            }
            return ((difference % 7) + 3) % 7;
        }
        private Boolean isLeapYear(int year)
        {
            if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) return true;
            return false;
        }

    }
}
