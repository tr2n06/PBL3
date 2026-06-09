using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Pbl3.DataAccess.Data;
using Pbl3.DataAccess.Models.Bookings;
using Pbl3.DataAccess.Models.Payment;
using Pbl3.DataAccess.Models.Users;
using Pbl3.DataAccess.Models.Flights;
using Pbl3.DataAccess.Models.Others;
using Pbl3.Repositories.Interface;

namespace Pbl3.Repositories.Implementation
{
    public class PaymentRepository : IPaymentRepository
    {
        private readonly AppDbContext _context;

        public PaymentRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task InsertTransactionAsync(Transaction transaction)
        {
            await _context.Transaction.AddAsync(transaction);
        }

        public async Task InsertBookingAsync(Booking booking)
        {
            await _context.Booking.AddAsync(booking);
        }

        public async Task InsertTicketAsync(Ticket ticket)
        {
            await _context.Ticket.AddAsync(ticket);
        }

        public async Task<Booking> GetBookingByCodeAsync(string codeBooking)
        {
            return await _context.Booking
                .Include(b => b.tickets)
                    .ThenInclude(t => t.baggages)
                .Include(b => b.transaction)
                .FirstOrDefaultAsync(b => b.codeBooking == codeBooking);
        }

        public async Task<Transaction> GetTransactionByCodeAsync(string codeTransaction)
        {
            return await _context.Transaction.FirstOrDefaultAsync(t => t.codeTransaction == codeTransaction);
        }

        public async Task<bool> ExistedCodeBookingAsync(string codeBooking)
        {
            return await _context.Booking.AnyAsync(b => b.codeBooking == codeBooking);
        }

        public async Task<Passenger> GetPassengerByIdAsync(int userId)
        {
            return await _context.Passenger.FirstOrDefaultAsync(p => p.id == userId);
        }


        public async Task InsertBaggageAsync(Baggage baggage)
        {
            await _context.Baggage.AddAsync(baggage);
        }

        public async Task<bool> IsSeatAlreadyBookedAsync(string codeSeat, string codeFlight, DateOnly departureDate, TimeOnly departureTime)
        {
            return await _context.Ticket.AnyAsync(t =>
                t.codeSeat == codeSeat &&
                t.codeFlight == codeFlight &&
                t.departureDate == departureDate &&
                t.departureTime == departureTime &&
                t.status != "cancelled");
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
