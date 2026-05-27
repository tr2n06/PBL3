using Pbl3.DTOs.Bookings;
namespace Pbl3.Repositories.Interface
{
    public interface IBookingRepository
    {
        public Task insertBooking(BookingRequestDTO dto);
        //public Task updateBooking(BookingRequestDTO dto);
        public Task<BookingResponseDTO> getBooking(string codeBooking);
        public Task deleteBooking(BookingRequestDTO dto);
        public Task<Boolean> existedCodeBooking(string codeBooking);
        public Task<List<SeatResponseDTO>> getSeatMap(SeatRequestDTO dto);
    }
}
