namespace Pbl3.DTOs.Statistics
{
    public class RevenuePointDTO
    {
        public string Month { get; set; } = string.Empty;
        public decimal Revenue { get; set; }
        public int Bookings { get; set; }
    }
}