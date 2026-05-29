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
                bookedTime = dto.bookedTime,
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
                                     bookedTime = b.bookedTime,
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
            var seats = await (from s in context.FlightSeat
                               where dto.flightcode == s.codeFlight && dto.arriveDate == s.arriveDate && dto.arriveTime == s.arriveTime && dto.typeTicket == s.seat.codeType
                               select new SeatResponseDTO
                               {
                                   seatNumber = s.codeSeat,
                                   status = (s.isBooked) ? "booked" : "available"
                               }).ToListAsync();
            return seats;
        }
    }
}
