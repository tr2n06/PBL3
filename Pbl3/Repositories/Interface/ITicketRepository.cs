using Pbl3.DTOs.Bookings;
using Pbl3.DTOs.Flight;
namespace Pbl3.Repositories.Interface
{
    public interface ITicketRepository
    {
        public Task insertTicket(TicketRequestDTO dto);
        public Task updateTicket(TicketRequestDTO dto);
        public Task deleteTicket(TicketRequestDTO dto);
        public Task<TicketResponseDTO> getTicket(string codeTicket);
        public Task<List<TicketDTO>> getTicketByBookingCode(string codeBooking);
        public Task<int> getNumberOfTicketByCode(string code);
        public Task<BaggageApiDTO> getBaggageByTickets(string codeTicket);
        public Task<List<TicketDTO>> getTickets(int id);

    }
}
