using Pbl3.DTOs.Statistics;

namespace Pbl3.Services.Interfaces
{
    public interface IStatisticsService
    {
        Task<StatisticsResponseDTO> GetStatistics(string period);
    }
}