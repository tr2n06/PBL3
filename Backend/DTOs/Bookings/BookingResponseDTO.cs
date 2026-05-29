namespace Pbl3.DTOs.Bookings
{
    public class BookingResponseDTO
    {
        public string codeBooking { get; set; }
        public int idUser { get; set; }
        public string codeTransaction { get; set; }
        public decimal bookedPrice { get; set; }
        public DateTime bookedTime { get; set; }
    }
}
