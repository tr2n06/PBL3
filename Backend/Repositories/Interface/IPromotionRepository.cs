using Pbl3.DTOs.Baggage;
using Pbl3.DataAccess.Models.Others;
using Pbl3.DataAccess.Models.Promotions;
using Pbl3.DataAccess.Models.Flights;
namespace Pbl3.Repositories.Interface
{
    public interface IPromotionRepository
    {
        Task<List<Promotion>> GetActivePromotions();
        Task<List<Flight>> GetCandidateFlights();

        Task<Promotion> GetById(string id);

        Task Add(Promotion promotion);
        Task Delete(string promotion_id);
        Task<bool> isPromotion(string codeFlight, DateOnly arriveDate, TimeOnly arriveTime);
    }
}