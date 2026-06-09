namespace Pbl3.DTOs.Bookings
{
    public class SeatRequestDTO
    {
        public string flightcode { get; set; }
        public DateOnly departureDate { get; set; }
        public TimeOnly departureTime { get; set; }
        public int typeTicket  { get; set; }    
    }
}