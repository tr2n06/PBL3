namespace Pbl3.DTOs.Flight
{
    public class LowBookingDTOResponse
    {
        public int account_id { get; set; }
        public string codeFlight { get; set; }
        public DateOnly arriveDate { get; set; }
        public TimeOnly arriveTime { get; set; }
        public int discount { get; set; }
        public string type { get; set; }
        public string state { get; set; } //pending accepted rejected
    }
}
