namespace Pbl3.DTOs.Statistics
{
    public class CancellationTrendPointDTO
    {
        public string Month { get; set; } = string.Empty;
        public int Cancellations { get; set; }
        public double Rate { get; set; }
    }
}