namespace Pbl3.DTOs.Flight
{
    public class FlightSearchDTO
    {
        public string codeFlight { get; set; }
        public DateOnly? departureDate { get; set; }
        public TimeOnly? departureTime { get; set; }
    }
}
 