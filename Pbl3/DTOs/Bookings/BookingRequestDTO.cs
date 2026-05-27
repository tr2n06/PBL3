namespace Pbl3.DTOs.Bookings
{
    public class BookingRequestDTO
    {
        public string codeBooking { get; set; }
        public int idUser { get; set; }
        public string codeTransaction { get; set; }
        public int bookedPrice { get; set; }
        public DateTime bookedTime { get; set; }
    }
}
