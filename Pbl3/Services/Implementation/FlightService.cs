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
            var currentDate = DateOnly.FromDateTime(DateTime.Now);
            var InformationDetail = await repository.getInformationDetail(dto);
            int day = this.day(dto.arriveDate);
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
            dto.flightNumber = InformationDetail.codeFlight;
            try
            {
                await this.insertSeatFlight(dto);
                await repository.insertFlight(dto);
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
                arriveDate = dto.arriveDate,
                arriveTime = dto.arriveTime
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
            FlightDTO flight;
            var key = await this.getKeyFromId(flightId);
            do
            {
                flight = await repository.getFlight(new FlightSearchDTO
                {
                    codeFlight = dto.flightNumber ?? "",
                    arriveDate = dto.arriveDate,
                    arriveTime = dto.arriveTime
                });
                if (flight != null)
                {
                    var newTime = dto.arriveTime.AddMinutes(5);
                    if (newTime < dto.arriveTime)
                    {
                        dto.arriveDate = dto.arriveDate.AddDays(1);
                    }
                    dto.arriveTime = newTime;
                    newTime = dto.departureTime.AddMinutes(5);
                    if (newTime < dto.departureTime)
                    {
                        dto.departureDate = dto.departureDate.AddDays(1);
                    }
                    dto.departureTime = newTime;
                }

            }
            while (flight != null);
            try
            {
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
                flight.price.bussiness = (await repository.getTicketType(1))?.priceBooked ?? 0;
                flight.price.economy = (await repository.getTicketType(2))?.priceBooked ?? 0;
                flight.price.firstClass = (await repository.getTicketType(3))?.priceBooked ?? 0;
                dto.arriveDate = DateOnly.ParseExact(flight.arrival.date, "dd/MM/yyyy", null);
                var discount = await repository.getDiscountFlight(dto);
                if (discount != null) 
                {
                    flight.price.bussiness = flight.price.bussiness * (1 - (discount.discount ?? 0) / 100m);

                    flight.price.economy = flight.price.economy * (1 - (discount.discount ?? 0) / 100m);

                    flight.price.firstClass = flight.price.firstClass * (1 - (discount.discount ?? 0) / 100m);
                }
                flight.discount = discount?.discount ?? 0;

                var detailFlight = await repository.getFlightDetail(dto);
                flight.arrival.city = (await repository.getFullName(detailFlight.fromCity)) ?? "";
                flight.departure.city = (await repository.getFullName(detailFlight.toCity)) ?? "";

                var seats = await repository.getAvailableSeatFlight(dto);
                foreach (var seat in seats)
                {
                    if (seat.codeType == 1) flight.seatsAvailable.economy++;
                    else if (seat.codeType == 2) flight.seatsAvailable.bussiness++;
                    else if (seat.codeType == 3) flight.seatsAvailable.firstClass++;
                }

                var selectedseats = await repository.getSelectedSeatFlight(dto);
                flight.hasBookings = selectedseats.Count > 0;
                flight.bookingCount = selectedseats.Count;

                string id = $"{flight.flightNumber}-{flight.arrival.date:ddMMyyyy}-{flight.arrival.time:HHmmss}";
                flight.id = id;

                TimeSpan duration = DateOnly.ParseExact(flight.departure.date, "dd/MM/yyyy", null).ToDateTime(TimeOnly.ParseExact(flight.departure.time, "HH:mm:ss", null)) - DateOnly.ParseExact(flight.arrival.date, "dd/MM/yyyy", null).ToDateTime(TimeOnly.ParseExact(flight.arrival.time, "HH:mm:ss", null));
                flight.duration = duration.ToString();

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
                    flight.price.bussiness = (await repository.getTicketType(1))?.priceBooked ?? 0;
                    flight.price.economy = (await repository.getTicketType(2))?.priceBooked ?? 0;
                    flight.price.firstClass = (await repository.getTicketType(3))?.priceBooked ?? 0;
                    dto.arriveDate = DateOnly.ParseExact(flight.arrival.date, "dd/MM/yyyy", null);
                    var discount = await repository.getDiscountFlight(dto);
                    if (discount != null)
                    {
                        flight.price.bussiness = flight.price.bussiness * (1 - (discount.discount ?? 0) / 100m);

                        flight.price.economy = flight.price.economy * (1 - (discount.discount ?? 0) / 100m);

                        flight.price.firstClass = flight.price.firstClass * (1 - (discount.discount ?? 0) / 100m);
                    }
                    flight.discount = discount?.discount ?? 0;

                    var detailFlight = await repository.getFlightDetail(dto);
                    flight.arrival.city = (await repository.getFullName(detailFlight.fromCity)) ?? "";
                    flight.departure.city = (await repository.getFullName(detailFlight.toCity)) ?? "";

                    var seats = await repository.getAvailableSeatFlight(dto);
                    foreach (var seat in seats)
                    {
                        if (seat.codeType == 1) flight.seatsAvailable.economy++;
                        else if (seat.codeType == 2) flight.seatsAvailable.bussiness++;
                        else if (seat.codeType == 3) flight.seatsAvailable.firstClass++;
                    }

                    var selectedseats = await repository.getSelectedSeatFlight(dto);
                    flight.hasBookings = selectedseats.Count > 0;
                    flight.bookingCount = selectedseats.Count;

                    string id = $"{flight.flightNumber}-{flight.arrival.date:ddMMyyyy}-{flight.arrival.time:HHmmss}";
                    flight.id = id;

                    TimeSpan duration = DateOnly.ParseExact(flight.departure.date, "dd/MM/yyyy", null).ToDateTime(TimeOnly.ParseExact(flight.departure.time, "HH:mm:ss", null)) - DateOnly.ParseExact(flight.arrival.date, "dd/MM/yyyy", null).ToDateTime(TimeOnly.ParseExact(flight.arrival.time, "HH:mm:ss", null));
                    flight.duration = duration.ToString();
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
                        codeFlight = flight.id,
                        arriveDate = DateOnly.ParseExact(flight.arrival.date, "dd/MM/yyyy", null),
                        arriveTime = TimeOnly.ParseExact(flight.arrival.time, "HH:mm:ss", null)
                    };
                    flight.price.bussiness = (await repository.getTicketType(1))?.priceBooked ?? 0;
                    flight.price.economy = (await repository.getTicketType(2))?.priceBooked ?? 0;
                    flight.price.firstClass = (await repository.getTicketType(3))?.priceBooked ?? 0;
                    var discount = await repository.getDiscountFlight(dto);
                    if (discount != null)
                    {
                        flight.price.bussiness = flight.price.bussiness * (1 - (discount.discount ?? 0) / 100m);

                        flight.price.economy = flight.price.economy * (1 - (discount.discount ?? 0) / 100m);

                        flight.price.firstClass = flight.price.firstClass * (1 - (discount.discount ?? 0) / 100m);
                    }
                    flight.discount = discount?.discount ?? 0;

                    var detailFlight = await repository.getFlightDetail(dto);
                    flight.arrival.city = (await repository.getFullName(detailFlight.fromCity)) ?? "";
                    flight.departure.city = (await repository.getFullName(detailFlight.toCity)) ?? "";

                    var seats = await repository.getAvailableSeatFlight(dto);
                    foreach (var seat in seats)
                    {
                        if (seat.codeType == 1) flight.seatsAvailable.economy++;
                        else if (seat.codeType == 2) flight.seatsAvailable.bussiness++;
                        else if (seat.codeType == 3) flight.seatsAvailable.firstClass++;
                    }

                    var selectedseats = await repository.getSelectedSeatFlight(dto);
                    flight.hasBookings = selectedseats.Count > 0;
                    flight.bookingCount = selectedseats.Count;

                    string id = $"{flight.flightNumber}-{flight.arrival.date:ddMMyyyy}-{flight.arrival.time:HHmmss}";
                    flight.id = id;

                    TimeSpan duration = DateOnly.ParseExact(flight.departure.date, "dd/MM/yyyy", null).ToDateTime(TimeOnly.ParseExact(flight.departure.time, "HH:mm:ss", null)) - DateOnly.ParseExact(flight.arrival.date, "dd/MM/yyyy", null).ToDateTime(TimeOnly.ParseExact(flight.arrival.time, "HH:mm:ss", null));
                    flight.duration = duration.ToString();
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
                var flights = await repository.getFlights(new FlightSearchDTO
                {
                    codeFlight = detailInformation.codeFlight,
                    arriveDate = DateOnly.ParseExact(dto.departDate, "dd/MM/yyyy", null),
                });
                foreach (var flight in flights)
                {
                    flight.price.bussiness = (await repository.getTicketType(1))?.priceBooked ?? 0;
                    flight.price.economy = (await repository.getTicketType(2))?.priceBooked ?? 0;
                    flight.price.firstClass = (await repository.getTicketType(3))?.priceBooked ?? 0;
                    var discount = await repository.getDiscountFlight(new FlightSearchDTO
                    {
                        codeFlight = detailInformation.codeFlight,
                        arriveDate = DateOnly.ParseExact(dto.departDate, "dd/MM/yyyy", null),
                        arriveTime = TimeOnly.ParseExact(flight.arrival.time, "HH:mm:ss", null)
                    });
                    if (discount != null)
                    {
                        flight.price.bussiness = flight.price.bussiness * (1 - (discount.discount ?? 0) / 100m);

                        flight.price.economy = flight.price.economy * (1 - (discount.discount ?? 0) / 100m);

                        flight.price.firstClass = flight.price.firstClass * (1 - (discount.discount ?? 0) / 100m);
                    }
                    flight.discount = discount?.discount ?? 0;

                    var detailFlight = await repository.getFlightDetail(new FlightSearchDTO
                    {
                        codeFlight = detailInformation.codeFlight,
                        arriveDate = DateOnly.ParseExact(dto.departDate, "dd/MM/yyyy", null),
                        arriveTime = TimeOnly.ParseExact(flight.arrival.time, "HH:mm:ss", null)
                    }); ;
                    flight.arrival.city = (await repository.getFullName(detailFlight.fromCity)) ?? "";
                    flight.departure.city = (await repository.getFullName(detailFlight.toCity)) ?? "";

                    var seats = await repository.getAvailableSeatFlight(new FlightSearchDTO
                    {
                        codeFlight = detailInformation.codeFlight,
                        arriveDate = DateOnly.ParseExact(dto.departDate, "dd/MM/yyyy", null),
                        arriveTime = TimeOnly.ParseExact(flight.arrival.time, "HH:mm:ss", null)
                    }); ;
                    foreach (var seat in seats)
                    {
                        if (seat.codeType == 1) flight.seatsAvailable.economy++;
                        else if (seat.codeType == 2) flight.seatsAvailable.bussiness++;
                        else if (seat.codeType == 3) flight.seatsAvailable.firstClass++;
                    }

                    var selectedseats = await repository.getSelectedSeatFlight(new FlightSearchDTO
                    {
                        codeFlight = detailInformation.codeFlight,
                        arriveDate = DateOnly.ParseExact(dto.departDate, "dd/MM/yyyy", null),
                        arriveTime = TimeOnly.ParseExact(flight.arrival.time, "HH:mm:ss", null)
                    });
                    flight.hasBookings = selectedseats.Count > 0;
                    flight.bookingCount = selectedseats.Count;

                    TimeSpan duration = DateOnly.ParseExact(flight.departure.date, "dd/MM/yyyy", null).ToDateTime(TimeOnly.ParseExact(flight.departure.time, "HH:mm:ss", null)) - DateOnly.ParseExact(dto.departDate, "dd/MM/yyyy", null).ToDateTime(TimeOnly.ParseExact(flight.arrival.time, "HH:mm:ss", null));
                    flight.duration = duration.ToString();

                    string id = $"{flight.flightNumber}-{flight.arrival.date:ddMMyyyy}-{flight.arrival.time:HHmmss}";
                    flight.id = id;

                    if (dto.passengers - dto.infants <= flight.seatsAvailable.economy || dto.passengers - dto.infants <= flight.seatsAvailable.bussiness || dto.passengers - dto.infants <= flight.seatsAvailable.firstClass)
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
                            businessPrice = flight.price.bussiness,
                            firstClassPrice = flight.price.firstClass,
                            economySeats = flight.seatsAvailable.economy,
                            businessSeats = flight.seatsAvailable.bussiness,
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
                        codeFlight = dto.flightNumber ?? "",
                        arriveDate = dto.arriveDate,
                        arriveTime = dto.arriveTime,
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
                    arriveDate = date,
                    arriveTime = time
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
                throw new Exception("Not existed flight");
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
