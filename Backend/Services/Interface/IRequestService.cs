using Pbl3.DTOs.Statistics;
using Pbl3.Repositories.Interface;
using Pbl3.Repositories.Interfaces;
using Pbl3.DTOs.Requests;
using Pbl3.DTOs.Promotion;

namespace Pbl3.Services.Implementations
{
    public interface IRequestService
    {
        public Task<List<RequestResponseDTO>> getPendingRequests();
        Task acceptRequest(string request_id, int admin_id);
        Task rejectRequest(RejectedRequestDTO dto);

        //profile-edit 
        public Task insertRequest(StaffRequestDTO dto);
        public Task<StaffRequestResponseDTO> getRequest(int requester_id);
        public Task<StaffRequestResponseDTO> getRequest(string id);

        //promotion
        public Task<List<PromotionRequestResponseDTO>> getPendingPromotionRequests();
        public Task createPromotionRequest(CreatePromotionRequestDTO dto);
        public Task createPromotionCancellationRequest(CancellationRequestDTO dto);
        public Task<List<CancellationPromotionRequestResponseDTO>> getPendingCancellationPromotionRequests();

        //Cancellation
        public Task<List<TicketCancellationRequestResponseDTO>> getPendingTicketCancellationRequests();
        public Task<TicketCancellationRequestResponseDTO> getTicketCancellationRequest(string id);
        public Task createTicketCancellationRequest(TicketCancellationRequestDTO dto);

    }
}