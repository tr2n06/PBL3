using Pbl3.DTOs.Bookings;
using Pbl3.DTOs.Flight;
using Pbl3.DataAccess.Models.Bookings;
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
        public Task<List<TicketDTO>> getAllTickets();
        public Task UpgradeTicketAsync(string ticketId, string newClass, string? seatNumber, decimal upgradeFee, decimal seatFee);
        public Task insertRoadTickets(string codeTicket, string returnCodeTicket);
        public Task<List<RoundTickets>> getRoundTickets();
        public Task<int?> GetUserIdByTicketIdAsync(string ticketId);
        public Task AddPointsAsync(int userId, int points);
    }
}
