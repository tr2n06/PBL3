using Pbl3.Repositories.Interface;
using Pbl3.DataAccess.Data;
using Pbl3.DataAccess.Models.Others;
using Pbl3.DTOs.Baggage;
using Microsoft.EntityFrameworkCore;

namespace Pbl3.Repositories.Implementation
{
    public class BaggageRepository : IBaggageRepository
    {
        AppDbContext context;
        public BaggageRepository(AppDbContext context)
        {
            this.context = context;
        }
        public async Task insertBaggage(BaggageRequestDTO dto)
        {
            await context.AddAsync(new Baggage
            {
                codeBaggage = dto.codeBaggage,
                codeTransaction = dto.codeTransaction ?? "",
                codeTicket = dto.codeTicket,
                type = dto.type ?? "cabin",
                status = "pending",
                weight = dto.weight ?? 0
            });
            await context.SaveChangesAsync();
        }
        public async Task updateBaggage(BaggageRequestDTO dto)
        {
            var baggage = await (from b in context.Baggage
                                 where (b.codeBaggage == dto.codeBaggage)
                                 select b).FirstOrDefaultAsync();
            if (baggage != null)
            {
                baggage.codeTransaction = dto.codeTransaction ?? baggage.codeTransaction;
                baggage.weight = dto.weight ?? baggage.weight;
                baggage.status = dto.status ?? baggage.status;
                await context.SaveChangesAsync();
            }
        }
        public async Task deleteBaggage(BaggageRequestDTO dto)
        {
            var baggage = await (from b in context.Baggage
                                 where (b.codeBaggage == dto.codeBaggage)
                                 select b).FirstOrDefaultAsync();
            if (baggage != null)
            {
                context.Baggage.Remove(baggage);
                await context.SaveChangesAsync();
            }
        }
        public async Task<BaggageResponseDTO> getBaggage(BaggageRequestDTO dto)
        {
            var baggage = await (from b in context.Baggage
                                 where (b.codeBaggage == dto.codeBaggage)
                                 select new BaggageResponseDTO
                                 {
                                     codeTransaction = b.codeTransaction,
                                     codeTicket = b.codeTicket,
                                     weight = b.weight
                                 }).FirstOrDefaultAsync();
            return baggage;

        }
        public async Task<List<BaggageResponseDTO>> getBaggageByTicketCode(string codeTicket)
        {
            var baggages = await (from b in context.Baggage
                                  where b.codeTicket == codeTicket && b.status != "pending" && b.type == "cabin"
                                  select new BaggageResponseDTO
                                  {
                                      codeTransaction = b.codeTransaction,
                                      codeTicket = b.codeTicket,
                                      weight = b.weight
                                  }).ToListAsync();
            return baggages;

        }
        public async Task<Boolean> haveNotPaidBaggage(string codeTicket)
        {
            var baggage = await (from b in context.Baggage
                                 where b.codeTicket == codeTicket && b.codeTransaction == null
                                 select b).FirstOrDefaultAsync();
            if (baggage == null) return true;
            return false;
        }
        public async Task<int> getNumberOfBaggage(string codeTicket)
        {
            return await (from b in context.Baggage
                          where b.codeTicket == codeTicket && b.codeTransaction != null
                          select b).CountAsync();;
        }
    }
}
