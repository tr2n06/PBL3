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
        public async Task<int> getSumOfBaggageByTicketCode(string code)
        {
            var bs = await repository.getBaggageByTicketCode(code);
            int sum = 0;
            foreach(var b in bs)
            {
                sum += b.weight;
            }
            return sum;
        }
        public async Task<Boolean> haveNotPaidBaggage(string codeTicket)
        {
            return await repository.haveNotPaidBaggage(codeTicket);
        }
        public async Task<string> getKey(string codeTicket)
        {
            string code = codeTicket;
            int num = await repository.getNumberOfBaggage(codeTicket);
            num++;
            if (num < 10) code += "0" + num;
            else code += num;
            return code;
        }
    }
}
