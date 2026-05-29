using Pbl3.DTOs.Bookings;
using Pbl3.DTOs.Flight;
using Pbl3.DTOs.Others;
using Pbl3.DTOs.Promotion;
using Pbl3.DataAccess.Models.Promotions;
namespace Pbl3.Services.Interface
{
    public interface IPromotionService
{
    Task<List<PromotionDTO>> GetActivePromotions();
    Task<List<PromotionCandidateDTO>> GetCandidates(); 

    Task<Promotion> CreatePromotion(CreatePromotionRequestDTO dto);

    Task<bool> DeletePromotion(string id);
    Task<bool> isPromotion(string codeFlight, DateOnly arriveDate, TimeOnly arriveTime);
}
}
 