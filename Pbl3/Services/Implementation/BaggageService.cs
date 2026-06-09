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
            // Truncate ticket code prefix (seconds) if necessary to fit varchar(19) database limit
            string ticketPart = codeTicket.Length > 15 ? codeTicket.Substring(2) : codeTicket;
            string code = "BG" + ticketPart;
            int num = (await repository.getBaggageByTicketCode(codeTicket)).Count;
            num++;
            if (num < 10) code += "0" + num;
            else code += num;
            return code;
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
