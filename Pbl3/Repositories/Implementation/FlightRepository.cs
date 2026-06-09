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

            Console.WriteLine(dto.flightNumber);
            //
            await context.Flight.AddAsync(new Flight
            {
                codeFlight = dto.flightNumber ?? "",
                departureDate = DateOnly.Parse(dto.departureDate),
                departureTime = TimeOnly.Parse(dto.departureTime),
                landingDate = DateOnly.Parse(dto.arrivalDate),
                landingTime = TimeOnly.Parse(dto.arrivalTime),
                status = "scheduled",
                price = dto.price ?? 500000
            });
            await context.SaveChangesAsync();
        }
        public async Task insertDiscountFlight(LowBookingDTORequest dto)
        {
            await context.DiscountFlight.AddAsync(new DiscountFlight
            {
                codeFlight = dto.codeFlight,
                departureDate = DateOnly.Parse(dto.departureDate),
                departureTime = TimeOnly.Parse(dto.departureTime),
                discountPercentage = dto.discount ?? 1
            });
            await context.SaveChangesAsync();
        }
        public async Task updateFlight(UpdateFlightDTO dto, FlightSearchDTO key)
        {
            var flight = await (from f in context.Flight
                                where key.codeFlight == f.codeFlight && key.departureDate == f.departureDate && key.departureTime == f.departureTime
                                select f).FirstOrDefaultAsync<Flight>();
            if (flight == null) throw new Exception("Cannot find this flight");

            if (dto.departureDate != null)
            {
                flight.departureDate = DateOnly.Parse(dto.departureDate);
            }
            if (dto.departureTime != null)
            {
                flight.departureTime = TimeOnly.Parse(dto.departureTime);
            }
            if (dto.arrivalDate != null)
            {
                flight.landingDate = DateOnly.Parse(dto.arrivalDate);
            }
            if (dto.arrivalTime != null)
            {
                flight.landingTime = TimeOnly.Parse(dto.arrivalTime);
            }
            if (dto.priceFlight.HasValue)
            {
                flight.price = dto.priceFlight.Value;
            }
            if (dto.status != null)
            {
                flight.status = dto.status;
            }
            // if (dto.isPromotion.HasValue)
            // {
            //     flight.isPromotion = dto.isPromotion.Value;
            // }
            await context.SaveChangesAsync();
        }
        public async Task<FlightDTO> getFlight(FlightSearchDTO dto)
        {
            var f = await context.Flight
                                       .Where(f => f.codeFlight == dto.codeFlight && f.departureDate == dto.departureDate && f.departureTime == dto.departureTime)
                                       .Select(f => f)
                                       .FirstOrDefaultAsync();

            if (f == null) throw new Exception("Can't find this flight");

            var result = new FlightDTO
            {
                flightNumber = f.codeFlight,

                departure = new LocationDTO
                {
                    date = f.departureDate.ToString("yyyy-MM-dd"),
                    time = f.departureTime.ToString("HH:mm:ss")
                },

                arrival = new LocationDTO
                {
                    date = f.landingDate.ToString("yyyy-MM-dd"),
                    time = f.landingTime.ToString("HH:mm:ss")
                },

                price = new PriceDTO
                {
                    economy = f.price,
                    business = f.price,
                    firstClass = f.price
                },
                priceFlight = f.price,

                id = f.codeFlight + "-" + f.departureDate.ToString("ddMMyyyy") + "-" + f.departureTime.ToString("HHmmss") + "-",

                isPromotion = f.promotion != null,
                status = f.status
            };

            return result;
        }
        public async Task<List<FlightDTO>> getFlightSearchs(FlightSearchDTO dto)
        {
            var flights = await context.Flight
                                       .Where(f => f.codeFlight == dto.codeFlight && f.departureDate == dto.departureDate)
                                       .Select(f => f)
                                       .ToListAsync();

            var result = flights.Select(f => new FlightDTO
            {
                flightNumber = f.codeFlight,

                departure = new LocationDTO
                {
                    date = f.departureDate.ToString("yyyy-MM-dd"),
                    time = f.departureTime.ToString("HH:mm:ss")
                },

                arrival = new LocationDTO
                {
                    date = f.landingDate.ToString("yyyy-MM-dd"),
                    time = f.landingTime.ToString("HH:mm:ss")
                },

                price = new PriceDTO
                {
                    economy = f.price,
                    business = f.price,
                    firstClass = f.price
                },
                priceFlight = f.price,
                id = f.codeFlight + "-" + f.departureDate.ToString("ddMMyyyy") + "-" + f.departureTime.ToString("HHmmss"),
                isPromotion = f.promotion != null,
                status = f.status
            }).ToList();

            return result;
        }
        public async Task<List<FlightDTO>> getFlights(FlightSearchDTO dto)
        {

            var query = context.Flight.AsQueryable();
            query = query.Where(f => f.codeFlight == dto.codeFlight);
            if (dto.departureDate.HasValue)
            {
                query = query.Where(f => f.departureDate == dto.departureDate.Value);
            }
            var flights = await query.ToListAsync();

            var result = flights.Select(f => new FlightDTO
            {
                flightNumber = f.codeFlight,

                departure = new LocationDTO
                {
                    date = f.departureDate.ToString("yyyy-MM-dd"),
                    time = f.departureTime.ToString("HH:mm:ss")
                },

                arrival = new LocationDTO
                {
                    date = f.landingDate.ToString("yyyy-MM-dd"),
                    time = f.landingTime.ToString("HH:mm:ss")
                },

                price = new PriceDTO
                {
                    economy = f.price,
                    business = f.price,
                    firstClass = f.price
                },
                priceFlight = f.price,
                id = f.codeFlight + "-" + f.departureDate.ToString("ddMMyyyy") + "-" + f.departureTime.ToString("HHmmss"),
                isPromotion = f.promotion != null,
                status = f.status
            }).ToList();

            return result;
        }

        public async Task<List<FlightDTO>> getAllFlights()
        {
            var flights = await context.Flight.ToListAsync();

            var result = flights.Select(f => new FlightDTO
            {
                flightNumber = f.codeFlight,

                departure = new LocationDTO
                {
                    date = f.departureDate.ToString("yyyy-MM-dd"),
                    time = f.departureTime.ToString("HH:mm:ss")
                },

                arrival = new LocationDTO
                {
                    date = f.landingDate.ToString("yyyy-MM-dd"),
                    time = f.landingTime.ToString("HH:mm:ss")
                },

                price = new PriceDTO
                {
                    economy = f.price,
                    business = f.price,
                    firstClass = f.price
                },
                priceFlight = f.price,
                id = f.codeFlight + "-" + f.departureDate.ToString("ddMMyyyy") + "-" + f.departureTime.ToString("HHmmss"),
                isPromotion = f.promotion != null,
                status = f.status
            }).ToList();

            return result;
        }

        public async Task<LowBookingDTORequest> getDiscountFlight(FlightSearchDTO dto)
        {
            var flight = await (from f in context.DiscountFlight
                                where dto.codeFlight == f.codeFlight && dto.departureDate == f.departureDate && dto.departureTime == f.departureTime
                                select f).FirstOrDefaultAsync();
            if (flight == null)
            {
                return new LowBookingDTORequest
                {
                    discount = 0
                };
            }

            return new LowBookingDTORequest
            {
                codeFlight = flight.codeFlight,
                departureDate = flight.departureDate.ToString("yyyy-MM-dd"),
                departureTime = flight.departureTime.ToString("HH:mm:ss"),
                discount = flight.discountPercentage
            };
        }
        public async Task deleteFlight(FlightSearchDTO dto)
        {
            var flight = await (from f in context.Flight
                                where dto.codeFlight == f.codeFlight && dto.departureDate == f.departureDate && dto.departureTime == f.departureTime
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
                                where dto.codeFlight == f.codeFlight && dto.departureDate == f.departureDate && dto.departureTime == f.departureTime
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
                                          departure = new LocationDTO
                                          {
                                              code = f.@from,
                                              city = f.fromCity.fullName,
                                              airport = f.fromCity.airplane,
                                          },
                                          arrival = new LocationDTO
                                          {
                                              code = f.to,
                                              city = f.toCity.fullName,
                                              airport = f.toCity.airplane,
                                          }
                                      }).FirstOrDefaultAsync();
            if (flightDetail == null) throw new Exception("Cannot find this flight");
            return flightDetail;
        }

        public async Task<FromToDTO> getInformationDetail(CreateFlightDTO dto)
        {
            var informationDetail = await (from f in context.FromTo
                                           where dto.departureCode == f.@from && dto.arrivalCode == f.to
                                           select new FromToDTO
                                           {
                                               codeFlight = f.codeFlight,
                                               departure = new LocationDTO
                                               {
                                                   code = f.@from,
                                                   city = f.fromCity.fullName,
                                                   airport = f.fromCity.airplane,
                                               },
                                               arrival = new LocationDTO
                                               {
                                                   code = f.to,
                                                   city = f.toCity.fullName,
                                                   airport = f.toCity.airplane,
                                               }
                                           }).FirstOrDefaultAsync();
            if (informationDetail == null) throw new Exception("Cannot find this flight");
            return informationDetail;
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
            if (ticketType == null) throw new Exception("Cannot find this type of ticket");
            return ticketType;
        }
        public async Task insertRequest(LowBookingDTORequest dto)
        {
            await context.FlightRequest.AddAsync(new FlightRequest
            {
                requester_id = dto.account_id,
                codeFlight = dto.codeFlight,
                departureDate = DateOnly.Parse(dto.departureDate),
                departureTime = TimeOnly.Parse(dto.departureTime),
                discount = dto.discount ?? 0,
                type = dto.type
            });
            await context.SaveChangesAsync();
        }
        public async Task<List<LowBookingDTOResponse>> getRequestById(int account_id)
        {
            var request = await (from r in context.FlightRequest
                                 where r.requester_id == account_id
                                 select r).ToListAsync<FlightRequest>();
            var result = request.Select(r => new LowBookingDTOResponse
            {
                account_id = r.requester_id ?? 0,
                codeFlight = r.codeFlight,
                departureDate = r.departureDate.ToString("yyyy-MM-dd"),
                departureTime = r.departureTime.ToString("HH:mm:ss"),
                discount = r.discount,
                state = r.status,
                type = r.type
            }).ToList();
            return result;
        }
        public async Task updateRequest(LowBookingDTORequest dto)
        {
            if (dto.state == null) return;
            var request = await (from r in context.FlightRequest
                                 where r.requester_id == dto.account_id && r.codeFlight == dto.codeFlight && r.departureDate == DateOnly.Parse(dto.departureDate) && r.departureTime == TimeOnly.Parse(dto.departureTime)
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
                                 where r.codeFlight == dto.codeFlight && r.departureDate == DateOnly.Parse(dto.departureDate) && r.departureTime == TimeOnly.Parse(dto.departureTime)
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
                                 where r.codeFlight == dto.codeFlight && r.departureDate == DateOnly.Parse(dto.departureDate) && r.departureTime == TimeOnly.Parse(dto.departureTime)
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
                departureDate = dto.departureDate,
                departureTime = dto.departureTime,
                isBooked = false
            });
            await context.SaveChangesAsync();

        }
        public async Task updateSeatFlight(SeatSelectionDTO dto)
        {
            var seat = await (from s in context.FlightSeat
                              where s.codeSeat == dto.codeSeat && s.codeFlight == dto.codeFlight && s.departureDate == dto.departureDate && s.departureTime == dto.departureTime
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
                               where s.codeFlight == dto.codeFlight && s.departureDate == dto.departureDate && s.departureTime == dto.departureTime && s.isBooked == false
                               select new SeatSelectionDTO
                               {
                                   codeSeat = s.codeSeat,
                                   codeFlight = s.codeFlight,
                                   departureDate = s.departureDate,
                                   departureTime = s.departureTime,
                                   codeType = s.seat.codeType,
                                   isBooked = s.isBooked
                               }).ToListAsync<SeatSelectionDTO>();
            Console.WriteLine(seats.Count);
            return seats;
        }
        public async Task<List<SeatSelectionDTO>> getSelectedSeatFlight(FlightSearchDTO dto)
        {
            var seats = await (from s in context.FlightSeat
                               where s.codeFlight == dto.codeFlight && s.departureDate == dto.departureDate && s.departureTime == dto.departureTime && s.isBooked == true
                               select new SeatSelectionDTO
                               {
                                   codeSeat = s.codeSeat,
                                   codeFlight = s.codeFlight,
                                   departureDate = s.departureDate,
                                   departureTime = s.departureTime,
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
                                where dto.codeFlight == t.codeFlight && dto.departureDate == t.departureDate && dto.departureTime == t.departureTime
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
                                    departureDate = t.departureDate.ToString("yyyy-MM-dd"),
                                    departureTime = t.departureTime.ToString("HH:mm:ss"),
                                    departureCode = t.flight.fromTo.@from,
                                    departureAirport = t.flight.fromTo.fromCity.airplane,
                                    departureCity = t.flight.fromTo.fromCity.fullName,
                                    arrivalDate = t.flight.landingDate.ToString("yyyy-MM-dd"),
                                    arrivalTime = t.flight.landingTime.ToString("HH:mm:ss"),
                                    arrivalCode = t.flight.fromTo.to,
                                    arrivalCity = t.flight.fromTo.toCity.fullName,
                                    arrivalAirport = t.flight.fromTo.toCity.airplane,
                                    id = t.codeFlight + "-" + t.departureDate.ToString("ddMMyyyy") + "-" + t.departureTime.ToString("HHmmss")

                                }).FirstOrDefaultAsync();
            if (flight == null) throw new Exception("");
            return flight;
        }

        public async Task<List<PassengerFlightDTO>> getPassengerFlight(FlightSearchDTO dto)
        {
            return await (from t in context.Ticket
                          where t.codeFlight == dto.codeFlight && t.departureDate == dto.departureDate && t.departureTime == dto.departureTime && t.email != null
                          select new PassengerFlightDTO
                          {
                            name = t.name,
                            email = t.email
                          }).ToListAsync<PassengerFlightDTO>();
        }

        public async Task<string> getFlightNumber(string departureCode, string arrivalCode)
        {
            Console.WriteLine(departureCode + " " + arrivalCode);
            return await (from f in context.FromTo
                          where f.@from == departureCode && f.to == arrivalCode
                          select f.codeFlight).FirstOrDefaultAsync<string>();
        }   
    }
}
