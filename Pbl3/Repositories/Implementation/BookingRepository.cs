using Pbl3.Repositories.Interface;
using Pbl3.DTOs.Bookings;
using Pbl3.DataAccess.Data;
using Pbl3.DataAccess.Models.Bookings;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
namespace Pbl3.Repositories.Implementation
{
    public class BookingRepository : IBookingRepository
    {
        AppDbContext context;
        public BookingRepository(AppDbContext context)
        {
            this.context = context;
        }
        public async Task insertBooking(BookingRequestDTO dto)
        {
            await context.Booking.AddAsync(new Booking
            {
                codeBooking = dto.codeBooking,
                idUser = dto.idUser,
                codeTransaction = dto.codeTransaction,
                bookedPrice = dto.bookedPrice,
                bookedTime = DateTime.Parse(dto.bookedTime)
            });
            await context.SaveChangesAsync();
        }
        //public async Task updateBooking(BookingRequestDTO dto);
        public async Task<BookingResponseDTO> getBooking(string codeBooking)
        {
            var booking = await (from b in context.Booking
                                 where codeBooking == b.codeBooking
                                 select new BookingResponseDTO
                                 {
                                     codeBooking = b.codeBooking,
                                     idUser = b.idUser?? -1,
                                     codeTransaction = b.codeTransaction,
                                     bookedPrice = b.bookedPrice,
                                     bookedTime = b.bookedTime.ToString("yyyy-MM-ddTHH:mm:ss"),
                                 }).FirstOrDefaultAsync();
            return booking;
        }
        public async Task deleteBooking(BookingRequestDTO dto)
        {
            var booking = await (from b in context.Booking
                                 where dto.codeBooking == b.codeBooking
                                 select b).FirstOrDefaultAsync();
            if (booking != null) context.Booking.Remove(booking);
            await context.SaveChangesAsync();
        }
        public async Task<Boolean> existedCodeBooking(string codeBooking)
        {
            var booking = await (from b in context.Booking
                                 where codeBooking == b.codeBooking
                                 select b).FirstOrDefaultAsync();
            if (booking != null) return true;
            return false;
        }
        public async Task<List<SeatResponseDTO>> getSeatMap(SeatRequestDTO dto)
        {
            var bookedSeatsFromTickets = await context.Ticket
                .Where(t => t.codeFlight == dto.flightcode 
                         && t.departureDate == dto.departureDate 
                         && t.departureTime == dto.departureTime 
                         && t.status != "cancelled" 
                         && t.codeSeat != null)
                .Select(t => t.codeSeat)
                .ToListAsync();

            var seats = await (from s in context.FlightSeat
                               where dto.flightcode == s.codeFlight && dto.departureDate == s.departureDate && dto.departureTime == s.departureTime && dto.typeTicket == s.seat.codeType
                               select new SeatResponseDTO
                               {
                                   seatNumber = s.codeSeat,
                                   status = (s.isBooked || bookedSeatsFromTickets.Contains(s.codeSeat)) ? "booked" : "available"
                               }).ToListAsync();
            return seats;
        }
    }
}
