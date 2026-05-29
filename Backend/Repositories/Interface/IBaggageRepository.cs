using Pbl3.DTOs.Baggage;
namespace Pbl3.Repositories.Interface
{
    public interface IBaggageRepository
    {
        public Task insertBaggage(BaggageRequestDTO dto); // Khi tạo mới ticket thì codeTransaction của baggage trùng với codeTransaction của booking đó
        public Task updateBaggage(BaggageRequestDTO dto);
        public Task deleteBaggage(BaggageRequestDTO dto);
        public Task<BaggageResponseDTO> getBaggage(BaggageRequestDTO dto);
        public Task<List<BaggageResponseDTO>> getBaggageByTicketCode(string codeTicket);
        public Task<Boolean> haveNotPaidBaggage(string codeTicket); // Kiểm tra xem có baggage nào chưa được thanh toán hay không, nếu có thì không cho phép đặt thêm baggage 
        public Task<int> getNumberOfBaggage(string codeTicket);
    }
}
