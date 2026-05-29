using Pbl3.DTOs.Baggage;

namespace Pbl3.Services.Interface
{
    public interface IBaggageService
    {
        public Task insertBaggage(BaggageRequestDTO dto); // Khi tạo mới ticket thì codeTransaction của baggage trùng với codeTransaction của booking đó
        public Task updateBaggage(BaggageRequestDTO dto);
        public Task deleteBaggage(BaggageRequestDTO dto);
        public Task<BaggageResponseDTO> getBaggage(BaggageRequestDTO dto);
        public Task<List<BaggageResponseDTO>> getBaggageByTicketCode(string codeTicket);
        public Task<int> getSumOfBaggageByTicketCode(string code);
        public Task<Boolean> haveNotPaidBaggage(string codeTicket);
        public Task<string> getKey(string codeTicket);
    }
}
