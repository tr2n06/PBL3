using Pbl3.DTOs.Baggage;
using Pbl3.Services.Interface;
using Pbl3.Repositories.Interface;

namespace Pbl3.Services.Implementation
{
    public class BaggageService : IBaggageService
    {
        IBaggageRepository repository;
        public BaggageService(IBaggageRepository repository)
        {
            this.repository = repository;
        }
        public async Task insertBaggage(BaggageRequestDTO dto)
        {
            dto.codeBaggage = await this.getKey(dto.codeTicket);
            await repository.insertBaggage(dto);
        }
        public async Task updateBaggage(BaggageRequestDTO dto)
        {
            await repository.updateBaggage(dto);
        }
        public async Task deleteBaggage(BaggageRequestDTO dto)
        {
            await repository.deleteBaggage(dto); 
        }
        public async Task<BaggageResponseDTO> getBaggage(BaggageRequestDTO dto)
        {
            return await repository.getBaggage(dto);
        }
        public async Task<List<BaggageResponseDTO>> getBaggageByTicketCode(string codeTicket)
        {
            return await repository.getBaggageByTicketCode(codeTicket);
        }
        public async Task<Boolean> haveNotPaidBaggage(string codeTicket)
        {
            return await repository.haveNotPaidBaggage(codeTicket);
        }
        public async Task<string> getKey(string codeTicket)
        {
            string ticketPart = codeTicket.Length > 15 ? codeTicket.Substring(2) : codeTicket;
            string prefix = "BG" + ticketPart;
            if (prefix.Length > 17)
            {
                prefix = prefix.Substring(0, 17);
            }

            var existingCodes = (await repository.getBaggageByTicketCode(codeTicket))
                .Select(b => b.codeBaggage)
                .Where(code => !string.IsNullOrWhiteSpace(code))
                .ToHashSet(StringComparer.OrdinalIgnoreCase);

            for (int num = 1; num <= 99; num++)
            {
                string code = prefix + num.ToString("D2");
                if (!existingCodes.Contains(code))
                {
                    return code;
                }
            }

            throw new InvalidOperationException($"Cannot generate baggage code for ticket {codeTicket}.");
        }
        public async Task<int> getNumberOfCheckedBaggage(string codeTicket)
        {
            return await repository.getNumberOfCheckedBaggage(codeTicket);
        }
        public async Task<int> getNumberOfCabinBaggage(string codeTicket)
        {
            return await repository.getNumberOfCabinBaggage(codeTicket);
        }
    }
}
