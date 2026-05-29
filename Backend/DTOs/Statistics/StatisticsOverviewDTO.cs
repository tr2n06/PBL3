namespace Pbl3.DTOs.Statistics
{
    public class StatisticsOverviewDTO
    {
        public decimal TotalRevenue { get; set; }
        public double RevenueChange { get; set; }

        public int TotalBookings { get; set; }
        public double BookingsChange { get; set; }

        public int Cancellations { get; set; }
        public double CancellationsChange { get; set; }

        public double CancellationRate { get; set; }
        public double CancellationRateChange { get; set; }
    }
}