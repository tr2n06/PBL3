namespace Pbl3.DTOs.Bookings
{
    public class SeatRequestDTO
    {
        public string flightcode { get; set; }
        public DateOnly arriveDate { get; set; }
        public TimeOnly arriveTime { get; set; }
        public int typeTicket  { get; set; }    
    }
}