using Pbl3.DTOs.Statistics;
using Pbl3.Repositories.Interface;
using Pbl3.Repositories.Interfaces;
using Pbl3.Services.Interfaces;

namespace Pbl3.Services.Implementations
{
    public class StatisticsService : IStatisticsService
    {
        private readonly IStatisticsRepository _statisticsRepository;

        public StatisticsService(IStatisticsRepository statisticsRepository)
        {
            _statisticsRepository = statisticsRepository;
        }

        public async Task<StatisticsResponseDTO> GetStatistics(string period)
        {
            try
            {
                return await _statisticsRepository.GetStatistics(period);
            }
            catch(Exception e)
            {
                throw new Exception("Invalid!");
            }
        }
    }
}