namespace Pbl3.DTOs.Statistics
{
    public class StatisticsResponseDTO
    {
        public StatisticsOverviewDTO Overview { get; set; } = new();

        public List<RevenuePointDTO> RevenueData { get; set; } = new();

        public List<CancellationTrendPointDTO> CancellationData { get; set; } = new();

        public List<CancellationReasonItemDTO> CancellationReasons { get; set; } = new();

        public List<HighRiskCustomerItemDTO> FrequentCancellers { get; set; } = new();

        public CustomerOverviewDTO CustomerOverview { get; set; } = new();
    }
}