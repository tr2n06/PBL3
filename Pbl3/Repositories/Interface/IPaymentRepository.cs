using System.Threading.Tasks;
using Pbl3.DataAccess.Models.Bookings;
using Pbl3.DataAccess.Models.Payment;
using Pbl3.DataAccess.Models.Users;
using Pbl3.DataAccess.Models.Flights;
using Pbl3.DataAccess.Models.Others;

namespace Pbl3.Repositories.Interface
{
    public interface IPaymentRepository
    {
        Task InsertTransactionAsync(Transaction transaction);
        Task InsertBookingAsync(Booking booking);
        Task InsertTicketAsync(Ticket ticket);
        Task<Booking> GetBookingByCodeAsync(string codeBooking);
        Task<Transaction> GetTransactionByCodeAsync(string codeTransaction);
        Task<bool> ExistedCodeBookingAsync(string codeBooking);
        Task<Passenger> GetPassengerByIdAsync(int userId);
        Task InsertBaggageAsync(Baggage baggage);
        Task<bool> IsSeatAlreadyBookedAsync(string codeSeat, string codeFlight, DateOnly departureDate, TimeOnly departureTime);
        Task SaveChangesAsync();
    }
}
