using Pbl3.DTOs.Requests;
using Pbl3.DTOs.Promotion;

namespace Pbl3.Repositories.Interface
{
    public interface IRequestRepository
    {
        public Task<List<RequestResponseDTO>> getPendingRequests();
        public Task<string> getType(string id);
        public Task updateState(string id, string status, string? reason, int admin_id);

        //profile-edit
        public Task insertRequest(StaffRequestDTO dto);
        public Task updateRequest(string id, string state);
        public Task<StaffRequestResponseDTO> getRequest(int requester_id);
        public Task<StaffRequestResponseDTO> getRequest(string id);

        //promotion
        public Task<List<PromotionRequestResponseDTO>> getPendingPromotionRequests();
        public Task<PromotionRequestResponseDTO> getPromotionRequest(string id);
        public Task createPromotionRequest(CreatePromotionRequestDTO dto);
        public Task createPromotionCancellationRequest(CancellationRequestDTO dto);
        public Task<List<CancellationPromotionRequestResponseDTO>> getPendingCancellationPromotionRequests();
        public Task<CancellationPromotionRequestResponseDTO> getCancelPromotionRequest(string id);

        //Cancellation
        public Task<List<TicketCancellationRequestResponseDTO>> getPendingTicketCancellationRequests();
        public Task<TicketCancellationRequestResponseDTO> getTicketCancellationRequest(string id);
        public Task createTicketCancellationRequest(TicketCancellationRequestDTO dto);
        public Task<bool> isTicketCancellationRequested(string ticketId);

    }
}