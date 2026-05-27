using Microsoft.AspNetCore.Mvc;
using Pbl3.Services.Interface;
using Pbl3.Services.Interfaces;

namespace Pbl3.Controllers
{
    [ApiController]
    [Route("api/statistics")]
    public class StatisticsController : ControllerBase
    {
        private readonly IStatisticsService _statisticsService;

        public StatisticsController(IStatisticsService statisticsService)
        {
            _statisticsService = statisticsService;
        }

        [HttpGet]
        public async Task<IActionResult> GetStatistics([FromQuery] string period)
        {
            try
            {
                var result = await _statisticsService.GetStatistics(period);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}