using Pbl3.DataAccess.Models.Bookings;
using Pbl3.DTOs.Bookings;
using Pbl3.DTOs.Flight;
using Pbl3.DTOs.Baggage;
using Pbl3.Repositories.Interface;
using Pbl3.Services.Interface;
using System.Linq;

namespace Pbl3.Services.Implementation
{
    public class TicketService : ITicketService
    {
        private readonly ITicketRepository repository;
        private readonly IFlightService flightService;
        private readonly IBaggageService baggageService;
        private readonly IMailService mailService;
        public TicketService(ITicketRepository repository, IFlightService flightService, IBaggageService baggageService, IMailService mailService)
        {
            this.repository = repository;
            this.flightService = flightService;
            this.baggageService = baggageService;
            this.mailService = mailService;
        }
        public async Task insertTicket(TicketRequestDTO dto)
        {

            try
            {
                await repository.insertTicket(dto);
            }
            catch (Exception ex)
            {
                throw new Exception("Database error: " + ex.Message);
            }
        }
        public async Task updateTicket(TicketRequestDTO dto)
        {
            try
            {
                await repository.updateTicket(dto);
            }
            catch (Exception ex)
            {
                throw new Exception("Database error: " + ex.Message);
            }
        }
        public async Task deleteTicket(TicketRequestDTO dto)
        {
            try
            {
                await repository.deleteTicket(dto);
            }
            catch (Exception ex)
            {
                throw new Exception("Database error: " + ex.Message);
            }
        }
        public async Task<TicketResponseDTO> getTicket(string codeTicket)
        {
            try
            {
                var ticket = await repository.getTicket(codeTicket);

                int freeChecked = (ticket.ticketClass == "business") ? 25 : ((ticket.ticketClass == "economy") ? 20 : 35);
                int defaultCabin = (ticket.ticketClass == "firstClass") ? 12 : ((ticket.ticketClass == "business") ? 7 : 0);
                int dbChecked = await baggageService.getNumberOfCheckedBaggage(ticket.id);
                int dbCabin = await baggageService.getNumberOfCabinBaggage(ticket.id);
                ticket.baggage = new BaggageDTO
                {
                    cabin = dbCabin > 0 ? dbCabin : defaultCabin,
                    @checked = dbChecked > 0 ? dbChecked : freeChecked
                };
                ticket.baggage.priceCabin = 0; //cabin baggage không được mua thêm
                ticket.baggage.checkedCabin = (ticket.baggage.@checked > freeChecked) ? (ticket.baggage.@checked - freeChecked) * 40000 : 0;
                ticket.totalPrice = ticket.price + ticket.baggage.priceCabin + ticket.baggage.checkedCabin;

                var flight = await flightService.getFlightFromCodeTicket(ticket.id);
                ticket.flightId = flight.id;
                ticket.flight = new FlightInformation
                {
                  flightNumber = flight.flightNumber,  
                  airline = flight.airline,
                  duration = flight.duration,
                  arrival = new LocationDTO
                  {
                      code = flight.arrivalCode,
                      city = flight.arrivalCity,
                      airport = flight.arrivalAirport,
                      time = flight.arrivalTime,
                      date = flight.arrivalDate
                  },
                  departure = new LocationDTO
                  {
                      code = flight.departureCode,
                      city = flight.departureCity,
                      airport = flight.departureAirport,
                      time = flight.departureTime,
                      date = flight.departureDate
                  }
                };

                return ticket;
            }
            catch (Exception ex)
            {
                throw new Exception("Database error: " + ex.Message);
            }
        }
        public async Task<List<TicketDTO>> getTicketByBookingCode(string codeBooking)
        {
            try 
            {
                List<TicketDTO> list = await repository.getTicketByBookingCode(codeBooking);

                foreach (var ticket in list)
                {
                    int freeChecked = (ticket.ticketClass == "business") ? 25 : ((ticket.ticketClass == "economy") ? 20 : 35);
                    int defaultCabin = (ticket.ticketClass == "firstClass") ? 12 : ((ticket.ticketClass == "business") ? 7 : 0);
                    int dbChecked = await baggageService.getNumberOfCheckedBaggage(ticket.id);
                    int dbCabin = await baggageService.getNumberOfCabinBaggage(ticket.id);
                    ticket.baggage = new BaggageApiDTO
                    {
                        cabin = dbCabin > 0 ? dbCabin : defaultCabin,
                        @checked = dbChecked > 0 ? dbChecked : freeChecked
                    };
                    ticket.baggage.priceCabin = 0; //cabin baggage không được mua thêm
                    ticket.baggage.checkedCabin = (ticket.baggage.@checked > freeChecked) ? (ticket.baggage.@checked - freeChecked) * 40000 : 0;
                    ticket.totalPrice = ticket.price + ticket.baggage.priceCabin + ticket.baggage.checkedCabin;

                    ticket.flight = await flightService.getFlightFromCodeTicket(ticket.id);
                }
                return list;
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public async Task<ListTicketDTO> getTicketsListByBookingCode(string codeBooking)
        {
            try
            {
                var tickets = await getTicketByBookingCode(codeBooking);

                var roundTicketRelations = await repository.getRoundTickets();
                var result = new ListTicketDTO();
                var processedTicketIds = new System.Collections.Generic.HashSet<string>();

                foreach (var relation in roundTicketRelations)
                {
                    var outbound = tickets.FirstOrDefault(t => t.id == relation.codeTicket);
                    var returnTkt = tickets.FirstOrDefault(t => t.id == relation.returnCodeTicket);

                    if (outbound != null && returnTkt != null)
                    {
                        result.roundTickets.Add(new RoundTicketsDTO
                        {
                            ticket = outbound,
                            returnTicket = returnTkt
                        });
                        processedTicketIds.Add(outbound.id);
                        processedTicketIds.Add(returnTkt.id);
                    }
                }

                foreach (var ticket in tickets)
                {
                    if (!processedTicketIds.Contains(ticket.id))
                    {
                        result.tickets.Add(ticket);
                    }
                }

                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public async Task<string> createTicketCode()
        {
            string code = "";
            int number = TimeOnly.FromDateTime(DateTime.Now).Second;
            if (number < 10) code += "0";
            code += number.ToString();
            number = TimeOnly.FromDateTime(DateTime.Now).Minute;
            if (number < 10) code += "0";
            code += number.ToString();
            number = TimeOnly.FromDateTime(DateTime.Now).Hour;
            if (number < 10) code += "0";
            code += number.ToString();
            number = DateOnly.FromDateTime(DateTime.Now).Day;
            if (number < 10) code += "0";
            code += number.ToString();
            number = DateOnly.FromDateTime(DateTime.Now).Month;
            if (number < 10) code += "0";
            code += number.ToString();
            number = DateOnly.FromDateTime(DateTime.Now).Year;
            if (number < 10) code += "000";
            else if (number < 100) code += "00";
            else if (number < 1000) code += "0";
            code += number.ToString();
            number = await repository.getNumberOfTicketByCode(code);
            if (number < 10) code += "0";
            code += number.ToString();
            return code;
        }
        public async Task<ListTicketDTO> getMyTickets(int id)
        {
            try
            {
                var tickets = await repository.getTickets(id);

                foreach (var ticket in tickets)
                {
                    int freeChecked = (ticket.ticketClass == "business") ? 25 : ((ticket.ticketClass == "economy") ? 20 : 35);
                    int defaultCabin = (ticket.ticketClass == "firstClass") ? 12 : ((ticket.ticketClass == "business") ? 7 : 0);
                    int dbChecked = await baggageService.getNumberOfCheckedBaggage(ticket.id);
                    int dbCabin = await baggageService.getNumberOfCabinBaggage(ticket.id);
                    ticket.baggage = new BaggageApiDTO
                    {
                        cabin = dbCabin > 0 ? dbCabin : defaultCabin,
                        @checked = dbChecked > 0 ? dbChecked : freeChecked
                    };
                    ticket.baggage.priceCabin = 0; //cabin baggage không được mua thêm
                    ticket.baggage.checkedCabin = (ticket.baggage.@checked > freeChecked) ? (ticket.baggage.@checked - freeChecked) * 40000 : 0;
                    ticket.totalPrice = ticket.price + ticket.baggage.priceCabin + ticket.baggage.checkedCabin;

                    ticket.flight = await flightService.getFlightFromCodeTicket(ticket.id);
                }

                var roundTicketRelations = await repository.getRoundTickets();
                var result = new ListTicketDTO();
                var processedTicketIds = new System.Collections.Generic.HashSet<string>();

                foreach (var relation in roundTicketRelations)
                {
                    var outbound = tickets.FirstOrDefault(t => t.id == relation.codeTicket);
                    var returnTkt = tickets.FirstOrDefault(t => t.id == relation.returnCodeTicket);

                    if (outbound != null && returnTkt != null)
                    {
                        result.roundTickets.Add(new RoundTicketsDTO
                        {
                            ticket = outbound,
                            returnTicket = returnTkt
                        });
                        processedTicketIds.Add(outbound.id);
                        processedTicketIds.Add(returnTkt.id);
                    }
                }

                foreach (var ticket in tickets)
                {
                    if (!processedTicketIds.Contains(ticket.id))
                    {
                        result.tickets.Add(ticket);
                    }
                }

                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public async Task<List<TicketDTO>> getAllTickets()
        {
            try
            {
                var tickets = await repository.getAllTickets();

                foreach (var ticket in tickets)
                {
                    int freeChecked = (ticket.ticketClass == "business") ? 25 : ((ticket.ticketClass == "economy") ? 20 : 35);
                    int defaultCabin = (ticket.ticketClass == "firstClass") ? 12 : ((ticket.ticketClass == "business") ? 7 : 0);
                    int dbChecked = await baggageService.getNumberOfCheckedBaggage(ticket.id);
                    int dbCabin = await baggageService.getNumberOfCabinBaggage(ticket.id);
                    ticket.baggage = new BaggageApiDTO
                    {
                        cabin = dbCabin > 0 ? dbCabin : defaultCabin,
                        @checked = dbChecked > 0 ? dbChecked : freeChecked
                    };
                    ticket.baggage.priceCabin = 0; //cabin baggage không được mua thêm
                    ticket.baggage.checkedCabin = (ticket.baggage.@checked > freeChecked) ? (ticket.baggage.@checked - freeChecked) * 40000 : 0;
                    ticket.totalPrice = ticket.price + ticket.baggage.priceCabin + ticket.baggage.checkedCabin;

                    ticket.flight = await flightService.getFlightFromCodeTicket(ticket.id);
                }

                return tickets;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public async Task upgradeTicket(string ticketId, UpgradeTicketRequestDTO dto)
        {
            try
            {
                var oldTicket = await getTicket(ticketId);
                await repository.UpgradeTicketAsync(ticketId, dto.NewClass, dto.SeatNumber, dto.UpgradeFee, dto.SeatFee);
                var newTicket = await getTicket(ticketId);

                if (newTicket != null && !string.IsNullOrEmpty(newTicket.passengerEmail))
                {
                    await mailService.SendMail(
                        newTicket.passengerEmail,
                        "Thông báo nâng hạng vé máy bay thành công",
                        $@"
                        <div style='font-family: Arial, sans-serif; line-height:1.8; color:#333'>
                            <h2 style='color:#1890ff;'>Xác nhận nâng hạng vé thành công</h2>
                            <p>Kính gửi quý khách {newTicket.passengerName},</p>
                            <p>Skylines Airlines xin thông báo vé máy bay của quý khách đã được nâng hạng thành công.</p>
                            <div style='background-color:#f8f9fa;padding:15px;border-radius:5px;margin:20px 0'>
                                <p><b>Mã vé:</b> {newTicket.id}</p>
                                <p><b>Mã đặt chỗ (Booking Ref):</b> {newTicket.bookingRef}</p>
                                <p><b>Chuyến bay:</b> {oldTicket?.flight?.flightNumber}</p>
                                <p><b>Hành trình:</b> {oldTicket?.flight?.departure?.city} &rarr; {oldTicket?.flight?.arrival?.city}</p>
                                <p><b>Hạng vé cũ:</b> {oldTicket?.ticketClass}</p>
                                <p><b>Hạng vé mới:</b> <span style='color:#1890ff; font-weight:bold;'>{newTicket.ticketClass}</span></p>
                                <p><b>Mã ghế mới:</b> <span style='color:#1890ff; font-weight:bold;'>{newTicket.seatNumber}</span></p>
                            </div>
                            <p>Chúc quý khách có một chuyến bay an toàn và thoải mái cùng Skylines Airlines.</p>
                            <br/>
                            <p>Trân trọng,<br/><b>Skylines Airlines</b></p>
                        </div>"
                    );
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task insertRoadTickets(string codeTicket, string returnCodeTicket)
        {
            try
            {
                await repository.insertRoadTickets(codeTicket, returnCodeTicket);
            }
            catch (Exception ex)
            {
                throw new Exception("Database error: " + ex.Message);
            }
        }

        public async Task<int?> GetUserIdByTicketIdAsync(string ticketId)
        {
            try
            {
                return await repository.GetUserIdByTicketIdAsync(ticketId);
            }
            catch (Exception ex)
            {
                throw new Exception("Database error: " + ex.Message);
            }
        }

        public async Task AddPointsAsync(int userId, int points)
        {
            try
            {
                await repository.AddPointsAsync(userId, points);
            }
            catch (Exception ex)
            {
                throw new Exception("Database error: " + ex.Message);
            }
        }
    }
}
/*
public string id { get; set; }
        public string bookingRef { get; set; }
        public DateTime bookedAt { get; set; }
        public decimal totalPrice { get; set; }
        public string status { get; set; }

        public string passengerName { get; set; }
        public string? passengerEmail { get; set; }
        public string? seatNumber { get; set; }

        public string ticketClass { get; set; }

        public BaggageApiDTO baggage { get; set; }

        public FlightApiDTO flight { get; set; }
*/
