using Pbl3.DTOs.Bookings;
namespace Pbl3.Services.Interface
{
    public interface IBookingService
    {
        public Task insertBooking(BookingRequestDTO dto);
        //public Task upDateBooking(BookingRequestDTO dto);
        public Task<BookingResponseDTO> getBooking(string codeBooking);
        public Task<string> createCodeBooking();
        public Task deleteBooking (BookingRequestDTO dto);
        public Task<List<SeatResponseDTO>> getSeatMap(SeatRequestDTO dto);
    }
}
