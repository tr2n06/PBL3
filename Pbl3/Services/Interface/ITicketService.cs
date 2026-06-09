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
        public Task<ListTicketDTO> getTicketsListByBookingCode(string codeBooking);
        public Task<ListTicketDTO> getMyTickets(int id);
        public Task<List<TicketDTO>> getAllTickets();
        public Task<string> createTicketCode();
        public Task upgradeTicket(string ticketId, UpgradeTicketRequestDTO dto);
        public Task<decimal> CalculateUpgradeAmountAsync(string ticketId, string newClass, decimal seatFee);
        public Task insertRoadTickets(string codeTicket, string returnCodeTicket);
        public Task<int?> GetUserIdByTicketIdAsync(string ticketId);
        public Task AddPointsAsync(int userId, int points);
    }
}
  
