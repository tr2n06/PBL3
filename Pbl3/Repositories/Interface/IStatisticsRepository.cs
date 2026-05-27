using Pbl3.DTOs.Statistics;

namespace Pbl3.Repositories.Interfaces
{
    public interface IStatisticsRepository
    {
        Task<StatisticsResponseDTO> GetStatistics(string period);

    }
}