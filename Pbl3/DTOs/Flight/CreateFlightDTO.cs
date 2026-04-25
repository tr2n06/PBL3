namespace Pbl3.DTOs.Flight
{
    public class CreateFlightDTO
    {
        public string fromLocation { get; set; }
        public string toLocation { get; set; }
        public DateOnly arriveDate { get; set; }
        public TimeOnly arriveTime { get; set; }
        public DateOnly landingDate { get; set; }
        public TimeOnly landingTime { get; set; }
        public int price { get; set; }
    }
}
