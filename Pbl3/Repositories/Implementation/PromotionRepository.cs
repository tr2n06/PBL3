using Pbl3.DTOs.Baggage;
using Pbl3.DataAccess.Models.Others;
using Pbl3.DataAccess.Models.Promotions;
using Pbl3.DataAccess.Data;
using Pbl3.Repositories.Interface;
using Pbl3.DataAccess.Models.Flights;
using Microsoft.EntityFrameworkCore;
namespace Pbl3.Repositories.Implementation
{
    public class PromotionRepository : IPromotionRepository
    {
        private readonly AppDbContext _context;

        public PromotionRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Promotion>> GetActivePromotions()
        {
            return await _context.Promotions
                            .Include(p => p.flight)
                                .ThenInclude(f => f.fromTo)
                                    .ThenInclude(ft => ft.fromCity)
                            .Include(p => p.flight)
                                .ThenInclude(f => f.fromTo)
                                    .ThenInclude(ft => ft.toCity)
                            .Where(p => p.departureDate.ToDateTime(p.departureTime) > DateTime.Now)
                            .ToListAsync();
        }

        public async Task<List<Flight>> GetCandidateFlights()
        {
            return await _context.Flight
                .Include(f => f.fromTo)
                    .ThenInclude(ft => ft.fromCity)
                .Include(f => f.fromTo)
                    .ThenInclude(ft => ft.toCity)
                .Where(f => f.departureDate >= DateOnly.FromDateTime(DateTime.Now) && f.departureTime >= TimeOnly.FromDateTime(DateTime.Now) && f.promotion == null)
                .ToListAsync();
        }

        public async Task<Promotion> GetById(string id)
        {
            return await _context.Promotions.FirstOrDefaultAsync(x => x.id == id);
        }

        public async Task Add(Promotion promotion)
        {
            _context.Promotions.Add(promotion);
            _context.SaveChanges();
        }

        public async Task Delete(string promotion_id)
        {
            var p = await _context.Promotions.FirstOrDefaultAsync(x => x.id == promotion_id);
            if (p != null)
            {
                _context.Promotions.Remove(p);
                _context.SaveChanges();
            }
        }

        public async Task<bool> isPromotion(string codeFlight, DateOnly departureDate, TimeOnly departureTime)
        {
            var pro = await _context.Promotions.FirstOrDefaultAsync(p => p.codeFlight == codeFlight && p.departureDate == departureDate && p.departureTime == departureTime);
            if (pro != null) return false;
            return true;
        }
    }
}