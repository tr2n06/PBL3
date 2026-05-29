using Pbl3.DataAccess.Models.Bookings;
using Pbl3.DTOs.Bookings;
using Pbl3.DTOs.Flight;
using Pbl3.DTOs.Baggage;
using Pbl3.Repositories.Interface;
using Pbl3.Services.Interface;

namespace Pbl3.Services.Implementation
{
    public class TicketService : ITicketService
    {
        private readonly ITicketRepository repository;
        private readonly IFlightService flightService;
        private readonly IBaggageService baggageService;
        public TicketService(ITicketRepository repository, IFlightService flightService, IBaggageService baggageService)
        {
            this.repository = repository;
            this.flightService = flightService;
            this.baggageService = baggageService;
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

                ticket.baggage = new BaggageDTO
                {
                    cabin = 1,
                    @checked = await baggageService.getSumOfBaggageByTicketCode(ticket.id)
                };

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
                    ticket.baggage = new BaggageApiDTO
                    {
                        cabin = 1,
                        checkedBaggage = await baggageService.getSumOfBaggageByTicketCode(ticket.id)
                    };

                    ticket.flight = await flightService.getFlightFromCodeTicket(ticket.id);
                }
                return list;
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
        public async Task<List<TicketDTO>> getMyTickets(int id)
        {
            try
            {
                var tickets = await repository.getTickets(id);

                foreach (var ticket in tickets)
                {
                    ticket.baggage = new BaggageApiDTO
                    {
                        cabin = 1,
                        checkedBaggage = await baggageService.getSumOfBaggageByTicketCode(ticket.id)
                    };

                    ticket.flight = await flightService.getFlightFromCodeTicket(ticket.id);
                }
                return tickets;
            }
            catch (Exception e)
            {
                throw e;
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
