namespace Pbl3.DTOs.Statistics
{
    public class HighRiskCustomerItemDTO
    {
        public int Id { get; set; } 
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public int Cancellations { get; set; }
        public int TotalBookings { get; set; }
        public double Rate { get; set; }
        public string? Status { get; set; }
    }
}