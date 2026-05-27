using Pbl3.DataAccess.Data;
using Pbl3.DTOs.Flight;
using Pbl3.DTOs.Others;
using Pbl3.DTOs.Bookings;
using Pbl3.Repositories.Interface;
using Pbl3.DataAccess.Models.Flights;
using Pbl3.DataAccess.Models.Others;
using Microsoft.EntityFrameworkCore;

namespace Pbl3.Repositories.Implementation
{
    public class FlightRepository : IFlightRepository
    {
        AppDbContext context;
        public FlightRepository(AppDbContext _context)
        {
            context = _context;
        }
        public async Task insertFlight(CreateFlightDTO dto)
        {
            await context.Flight.AddAsync(new Flight
            {
                codeFlight = dto.flightNumber ?? "",
                arriveDate = dto.arriveDate,
                arriveTime = dto.arriveTime,
                landingDate = dto.departureDate,
                landingTime = dto.departureTime,
                status = "scheduled",
                price = dto.price ?? 0
            });
            await context.SaveChangesAsync();
        }
        public async Task insertDiscountFlight(LowBookingDTORequest dto)
        {
            await context.DiscountFlight.AddAsync(new DiscountFlight
            {
                codeFlight = dto.codeFlight,
                arriveDate = dto.arriveDate,
                arriveTime = dto.arriveTime,
                discountPercentage = dto.discount ?? 0
            });
            await context.SaveChangesAsync();
        }
        public async Task updateFlight(UpdateFlightDTO dto, FlightSearchDTO key)
        {
            var flight = await (from f in context.Flight
                                where key.codeFlight == f.codeFlight && key.arriveDate == f.arriveDate && key.arriveTime == f.arriveTime
                                select f).FirstOrDefaultAsync<Flight>();
            flight.arriveDate = dto.arriveDate;
            flight.arriveTime = dto.arriveTime;
            flight.landingDate = dto.departureDate;
            flight.landingTime = dto.departureTime;
            if (dto.price.HasValue)
            {
                flight.price = dto.price.Value;
            }
            // if (dto.isPromotion.HasValue)
            // {
            //     flight.isPromotion = dto.isPromotion.Value;
            // }
            await context.SaveChangesAsync();
        }
        public async Task<FlightDTO> getFlight(FlightSearchDTO dto)
        {
            var flight = await (from f in context.Flight
                                where dto.codeFlight == f.codeFlight && dto.arriveDate == f.arriveDate && dto.arriveTime == f.arriveTime
                                select new FlightDTO
                                {
                                    flightNumber = f.codeFlight,
                                    arrival = new LocationDTO
                                    {
                                        date = f.arriveDate.ToString("dd/MM/yyyy"),
                                        time = f.arriveTime.ToString(@"hh\:mm\:ss")
                                    },
                                    departure = new LocationDTO
                                    {
                                        date = f.landingDate.ToString("dd/MM/yyyy"),
                                        time = f.landingTime.ToString(@"hh\:mm\:ss")
                                    },
                                    price = new PriceDTO
                                    {
                                        economy = f.price,
                                        bussiness = f.price,
                                        firstClass = f.price
                                    },
                                    isPromotion = (f.promotion == null) ? false : true,
                                    status = f.status
                                }).FirstOrDefaultAsync<FlightDTO>();
            return flight;
        }
        public async Task<List<FlightDTO>> getFlightSearchs(FlightSearchDTO dto)
        {
            var flights = await (from f in context.Flight
                                 where dto.codeFlight == f.codeFlight && dto.arriveDate == f.arriveDate
                                 select new FlightDTO
                                 {
                                     flightNumber = f.codeFlight,
                                     arrival = new LocationDTO
                                     {
                                         date = f.arriveDate.ToString("dd/MM/yyyy"),
                                         time = f.arriveTime.ToString(@"hh\:mm\:ss")
                                     },
                                     departure = new LocationDTO
                                     {
                                         date = f.landingDate.ToString("dd/MM/yyyy"),
                                         time = f.landingTime.ToString(@"hh\:mm\:ss")
                                     },
                                     price = new PriceDTO
                                     {
                                         economy = f.price,
                                         bussiness = f.price,
                                         firstClass = f.price
                                     },
                                     isPromotion = (f.promotion == null) ? false : true,
                                     status = f.status
                                 }).ToListAsync<FlightDTO>();
            return flights;
        }
        public async Task<List<FlightDTO>> getFlights(FlightSearchDTO dto)
        {
            var flights = await (from f in context.Flight
                                 where dto.codeFlight == f.codeFlight
                                 select new FlightDTO
                                 {
                                     flightNumber = f.codeFlight,
                                     arrival = new LocationDTO
                                     {
                                         date = f.arriveDate.ToString("dd/MM/yyyy"),
                                         time = f.arriveTime.ToString(@"hh\:mm\:ss")
                                     },
                                     departure = new LocationDTO
                                     {
                                         date = f.landingDate.ToString("dd/MM/yyyy"),
                                         time = f.landingTime.ToString(@"hh\:mm\:ss")
                                     },
                                     price = new PriceDTO
                                     {
                                         economy = f.price,
                                         bussiness = f.price,
                                         firstClass = f.price
                                     },
                                     isPromotion = (f.promotion == null) ? false : true,
                                     status = f.status
                                 }).ToListAsync();
            return flights;
        }

        public async Task<List<FlightDTO>> getAllFlights()
        {
            var flights = await (from f in context.Flight
                                 select new FlightDTO
                                 {
                                     flightNumber = f.codeFlight,
                                     arrival = new LocationDTO
                                     {
                                         date = f.arriveDate.ToString("dd/MM/yyyy"),
                                         time = f.arriveTime.ToString(@"hh\:mm\:ss")
                                     },
                                     departure = new LocationDTO
                                     {
                                         date = f.landingDate.ToString("dd/MM/yyyy"),
                                         time = f.landingTime.ToString(@"hh\:mm\:ss")
                                     },
                                     price = new PriceDTO
                                     {
                                         economy = f.price,
                                         bussiness = f.price,
                                         firstClass = f.price
                                     },
                                     isPromotion = (f.promotion == null) ? false : true,
                                     status = f.status
                                 }).ToListAsync();
            return flights;
        }

        public async Task<LowBookingDTORequest> getDiscountFlight(FlightSearchDTO dto)
        {
            var flight = await (from f in context.DiscountFlight
                                where dto.codeFlight == f.codeFlight && dto.arriveDate == f.arriveDate && dto.arriveTime == f.arriveTime
                                select new LowBookingDTORequest
                                {
                                    codeFlight = f.codeFlight,
                                    arriveDate = f.arriveDate,
                                    arriveTime = f.arriveTime,
                                    discount = f.discountPercentage
                                }).FirstOrDefaultAsync<LowBookingDTORequest>();
            return flight;
        }
        public async Task deleteFlight(FlightSearchDTO dto)
        {
            var flight = await (from f in context.Flight
                                where dto.codeFlight == f.codeFlight && dto.arriveDate == f.arriveDate && dto.arriveTime == f.arriveTime
                                select f).FirstOrDefaultAsync<Flight>();
            if (flight != null)
            {
                flight.status = "canceled";
                await context.SaveChangesAsync();
            }
        }
        public async Task deleteDiscountFlight(FlightSearchDTO dto)
        {
            var flight = await (from f in context.DiscountFlight
                                where dto.codeFlight == f.codeFlight && dto.arriveDate == f.arriveDate && dto.arriveTime == f.arriveTime
                                select f).FirstOrDefaultAsync<DiscountFlight>();
            if (flight != null)
            {
                context.DiscountFlight.Remove(flight);
                await context.SaveChangesAsync();
            }
        }
        public async Task<FromToDTO> getFlightDetail(FlightSearchDTO dto)
        {
            var flightDetail = await (from f in context.FromTo
                                      where dto.codeFlight == f.codeFlight
                                      select new FromToDTO
                                      {
                                          codeFlight = f.codeFlight,
                                          fromCity = f.@from,
                                          toCity = f.to,
                                          length = f.length
                                      }).FirstOrDefaultAsync<FromToDTO>();
            return flightDetail;
        }

        public async Task<FromToDTO> getInformationDetail(CreateFlightDTO dto)
        {
            var informationDetail = await (from f in context.FromTo
                                           where dto.departureCode == f.@from && dto.arrivalCode == f.to
                                           select new FromToDTO
                                           {
                                               codeFlight = f.codeFlight,
                                               fromCity = f.@from,
                                               toCity = f.to,
                                               length = f.length
                                           }).FirstOrDefaultAsync<FromToDTO>();
            return informationDetail;
        }
        public Task<String> getFullName(string abriviateName)
        {
            var fullName = (from c in context.City
                            where c.abbreviatedName == abriviateName
                            select c.fullName).FirstOrDefaultAsync<string>();
            return fullName;
        }
        public async Task<TicketTypeDTO> getTicketType(int codeType)
        {
            var ticketType = await (from t in context.TicketType
                                    where t.codeType == codeType
                                    select new TicketTypeDTO
                                    {
                                        codeType = t.codeType,
                                        name = t.name,
                                        priceBooked = t.priceBooked,
                                        canBeUpgrade = t.canBeUpgrade,
                                        canBeCanceled = t.canBeCanceled,
                                        weightBaggage = t.weightBaggage
                                    }).FirstOrDefaultAsync<TicketTypeDTO>();
            return ticketType;
        }
        public async Task insertRequest(LowBookingDTORequest dto)
        {
            await context.FlightRequest.AddAsync(new FlightRequest
            {
                requester_id = dto.account_id,
                codeFlight = dto.codeFlight,
                arriveDate = dto.arriveDate,
                arriveTime = dto.arriveTime,
                discount = dto.discount ?? 0,
                type = dto.type
            });
            await context.SaveChangesAsync();
        }
        public async Task<List<LowBookingDTOResponse>> getRequestById(int account_id)
        {
            var request = await (from r in context.FlightRequest
                                 where r.requester_id == account_id
                                 select new LowBookingDTOResponse
                                 {
                                     account_id = r.requester_id ?? 0,
                                     codeFlight = r.codeFlight,
                                     arriveDate = r.arriveDate,
                                     arriveTime = r.arriveTime,
                                     discount = r.discount,
                                     state = r.status,
                                     type = r.type
                                 }).ToListAsync<LowBookingDTOResponse>();
            return request;
        }
        public async Task updateRequest(LowBookingDTORequest dto)
        {
            if (dto.state == null) return;
            var request = await (from r in context.FlightRequest
                                 where r.requester_id == dto.account_id && r.codeFlight == dto.codeFlight && r.arriveDate == dto.arriveDate && r.arriveTime == dto.arriveTime
                                 select r
                                ).FirstOrDefaultAsync();
            if (request != null)
            {
                request.status = dto.state;
                await context.SaveChangesAsync();
            }
        }
        public async Task updateRequests(LowBookingDTORequest dto)
        {
            if (dto.state == null) return;
            var request = await (from r in context.FlightRequest
                                 where r.codeFlight == dto.codeFlight && r.arriveDate == dto.arriveDate && r.arriveTime == dto.arriveTime
                                 select r
                                ).ToListAsync<Request>();
            if (request != null)
            {
                foreach (var r in request)
                {
                    r.status = dto.state;
                }
                await context.SaveChangesAsync();
            }
        }
        public async Task deleteRequest(LowBookingDTORequest dto)
        {
            var request = await (from r in context.FlightRequest
                                 where r.codeFlight == dto.codeFlight && r.arriveDate == dto.arriveDate && r.arriveTime == dto.arriveTime
                                 select r
                                ).ToListAsync<FlightRequest>();
            if (request != null)
            {
                foreach (var r in request)
                {
                    context.FlightRequest.Remove(r);
                }
                await context.SaveChangesAsync();
            }
        }
        public async Task insertSeatFlight(SeatSelectionDTO dto)
        {
            await context.FlightSeat.AddAsync(new FlightSeat
            {
                codeSeat = dto.codeSeat,
                codeFlight = dto.codeFlight,
                arriveDate = dto.arriveDate,
                arriveTime = dto.arriveTime,
                isBooked = false
            });
            await context.SaveChangesAsync();

        }
        public async Task updateSeatFlight(SeatSelectionDTO dto)
        {
            var seat = await (from s in context.FlightSeat
                              where s.codeSeat == dto.codeSeat && s.codeFlight == dto.codeFlight && s.arriveDate == dto.arriveDate && s.arriveTime == dto.arriveTime
                              select s).FirstOrDefaultAsync<FlightSeat>();
            if (seat != null)
            {
                seat.isBooked = dto.isBooked ?? seat.isBooked;
                await context.SaveChangesAsync();
            }
        }
        // public async Task deleteSeatFlight(FlightSearchDTO dto) // xóa ghế khi hủy chuyến bay
        // {
        //     var seats = await (from s in context.FlightSeat
        //                       where s.codeFlight == dto.codeFlight && s.arriveDate == dto.arriveDate && s.arriveTime == dto.arriveTime
        //                       select s).ToListAsync<FlightSeat>();
        //     if (seats != null)
        //     {
        //         foreach (var s in seats)
        //         {
        //             context.FlightSeat.Remove(s);
        //         }
        //         await context.SaveChangesAsync();
        //     }

        // }
        public async Task<List<SeatSelectionDTO>> getAvailableSeatFlight(FlightSearchDTO dto)
        {
            var seats = await (from s in context.FlightSeat
                               where s.codeFlight == dto.codeFlight && s.arriveDate == dto.arriveDate && s.arriveTime == dto.arriveTime && s.isBooked == false
                               select new SeatSelectionDTO
                               {
                                   codeSeat = s.codeSeat,
                                   codeFlight = s.codeFlight,
                                   arriveDate = s.arriveDate,
                                   arriveTime = s.arriveTime,
                                   isBooked = s.isBooked
                               }).ToListAsync<SeatSelectionDTO>();
            return seats;
        }
        public async Task<List<SeatSelectionDTO>> getSelectedSeatFlight(FlightSearchDTO dto)
        {
            var seats = await (from s in context.FlightSeat
                               where s.codeFlight == dto.codeFlight && s.arriveDate == dto.arriveDate && s.arriveTime == dto.arriveTime && s.isBooked == true
                               select new SeatSelectionDTO
                               {
                                   codeSeat = s.codeSeat,
                                   codeFlight = s.codeFlight,
                                   arriveDate = s.arriveDate,
                                   arriveTime = s.arriveTime,
                                   isBooked = s.isBooked
                               }).ToListAsync<SeatSelectionDTO>();
            return seats;
        }
        public async Task<int> getTypeSeat(string codeSeat)
        {
            var typeSeat = await (from f in context.Seat
                                  where f.codeSeat == codeSeat
                                  select f.codeType).FirstOrDefaultAsync();
            if (typeSeat == null) throw new Exception("Invalid seat"); 
            return typeSeat.Value;
        }
        public async Task<List<string>> getAllSeats()
        {
            return await (from s in context.Seat
                          select s.codeSeat).ToListAsync();
        }

        public async Task<Boolean> haveTicket(FlightSearchDTO dto)
        {
            var ticket = await (from t in context.Ticket
                                where dto.codeFlight == t.codeFlight && dto.arriveDate == t.arriveDate && dto.arriveTime == t.arriveTime
                                select t).FirstOrDefaultAsync();
            if (ticket != null) return true;
            return false;
        }

        public async Task<FlightApiDTO> getFlightFromCodeTicket(string codeTicket)
        {
            var flight = await (from t in context.Ticket
                                where (t.codeTicket == codeTicket)
                                select new FlightApiDTO
                                {
                                    flightNumber = t.codeFlight,
                                    arrivalDate = t.arriveDate.ToString("dd/MM/yyyy"),
                                    arrivalTime = t.arriveTime.ToString(@"hh\:mm\:ss"),
                                    arrivalCode = t.flight.fromTo.@from,
                                    arrivalAirport = t.flight.fromTo.fromCity.airplane,
                                    arrivalCity = t.flight.fromTo.fromCity.fullName,
                                    departureDate = t.flight.landingDate.ToString("dd/MM/yyyy"),
                                    departureTime = t.flight.landingTime.ToString(@"hh\:mm\:ss"),
                                    departureCode = t.flight.fromTo.to,
                                    departureCity = t.flight.fromTo.toCity.fullName,
                                    departureAirport = t.flight.fromTo.toCity.airplane,
                                    id = t.codeFlight + t.arriveDate.ToString("ddMMyyyy") + t.arriveTime.ToString(@"hhmmss")

                                }).FirstOrDefaultAsync();
            if (flight == null) throw new Exception("");
            return flight;
        }
    }



}
