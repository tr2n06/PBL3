namespace Pbl3.DTOs.Flight
{
    public class LowBookingDTO
    {
        public string code {  get; set; }
        public DateOnly? arriveDate { get; set; }
        public TimeOnly? arriveTime { get; set; }
    }
}
//