using Pbl3.DTOs.Bookings;
using Pbl3.DTOs.Flight;
namespace Pbl3.Services.Interface
{
    public interface ITicketService
    {
        public Task insertTicket(TicketRequestDTO dto);
        public Task updateTicket(TicketRequestDTO dto);
        public Task deleteTicket(TicketRequestDTO dto);
        public Task<TicketResponseDTO> getTicket(string codeTicket);
        public Task<List<TicketDTO>> getTicketByBookingCode(string codeBooking);
        public Task<List<TicketDTO>> getMyTickets(int id);
        public Task<string> createTicketCode();
    }
}
  