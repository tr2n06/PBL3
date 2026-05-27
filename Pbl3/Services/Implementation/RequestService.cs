using Pbl3.Repositories.Interface;
using Pbl3.DataAccess.Models.Users;
using Pbl3.DataAccess.Models.Bookings;
using Pbl3.DataAccess.Models.Flights;
using Pbl3.DataAccess.Data;
using Pbl3.DataAccess.Models.Promotions;
using Pbl3.Services.Interface;
using Microsoft.EntityFrameworkCore;
using Pbl3.DTOs.Promotion;
using Pbl3.DTOs.Flight;
using Pbl3.DTOs.Bookings;
using Pbl3.DTOs.Requests;
using Pbl3.DTOs.Auth;
using Pbl3.DTOs.Account;

namespace Pbl3.Services.Implementations
{
    public class RequestService : IRequestService
    {
        IRequestRepository repo;

        IAuthService authService;
        ITicketService ticketService;
        IFlightService flightService;
        IPromotionService promotionService;

        public async Task<List<RequestResponseDTO>> getPendingRequests()
        {
            var requests = await repo.getPendingRequests();
            foreach (var r in requests)
            {
                switch (r.type)
                {
                    case "profile-edit":
                        var request = await repo.getRequest(r.id);
                        r.data = new profile_editData
                        {
                            id = request.id ?? 0,
                            address = request.address,
                            email = request.email,
                            phone = request.phone
                        };
                        break;
                    case "promotion":
                        var pr = await repo.getPromotionRequest(r.id);
                        r.data = new promotionData
                        {
                            flightId = pr.flightId,
                            flightNumber = pr.flightNumber,
                            discount = pr.discount,
                            route = pr.route
                        };
                        break;
                    case "cancelPromotion":
                        var cpr = await repo.getCancelPromotionRequest(r.id);
                        r.data = new cancelPromotionData
                        {
                            promotionId = cpr.promotionId
                        };
                        break;
                    case "cancellation":
                        break;
                    default:
                        throw new Exception("Invalid type");
                }
            }
            return requests;
        }
        public RequestService(IRequestRepository repo, IAuthService authServiceuthService, ITicketService ticketServiceketService, IFlightService flightServiceghtService, IPromotionService promotionService)
        {
            this.repo = repo;
            this.authService = authService;
            this.ticketService = ticketService;
            this.flightService = flightService;
            this.promotionService = promotionService;
        }
        public async Task acceptRequest(string request_id, int admin_id)
        {
            var type = await repo.getType(request_id);
            switch (type)
            {
                case "profile-edit":
                    var request = await repo.getRequest(request_id);
                    await authService.updateUser(new UpdateUserDTO
                    {
                        id = request.id ?? 0,
                        address = request.address,
                        email = request.email,
                        phone = request.phone

                    });
                    break;
                case "promotion":
                    var pr = await repo.getPromotionRequest(request_id);
                    await promotionService.CreatePromotion(new CreatePromotionRequestDTO
                    {
                        flightId = pr.flightId,
                        discount = pr.discount,
                        reason = pr.reason
                    });
                    break;
                case "cancelPromotion":
                    var cpr = await repo.getCancelPromotionRequest(request_id);
                    await promotionService.DeletePromotion(cpr.promotionId);
                    break;
                case "cancellation":
                    var ct = await repo.getTicketCancellationRequest(request_id);
                    await ticketService.updateTicket(new TicketRequestDTO
                    {
                        codeTicket = ct.ticketId,
                        state = "cancel"
                    });
                    break;
                default:
                    throw new Exception("Invalid type");
            }
            await repo.updateState(request_id, "approved", null, admin_id);
        }
        public async Task rejectRequest(RejectedRequestDTO dto)
        {
            await repo.updateState(dto.requestId, "rejected", dto.reason, dto.admin_id?? 0);
        }

        //profile-edit
        public async Task insertRequest(StaffRequestDTO dto)
        {
            await repo.insertRequest(dto);
        }
        public async Task updateRequest(string id, string state)
        {
            await repo.updateRequest(id, state);
        }
        public async Task<StaffRequestResponseDTO> getRequest(int requester_id)
        {
            return await repo.getRequest(requester_id);
        }
        public async Task<StaffRequestResponseDTO> getRequest(string id)
        {
            return await repo.getRequest(id);
        }

        //promotion
        public async Task<List<PromotionRequestResponseDTO>> getPendingPromotionRequests()
        {
            return await repo.getPendingPromotionRequests();
        }
        public async Task createPromotionRequest(CreatePromotionRequestDTO dto)
        {
            var key = await flightService.getKeyFromId(dto.flightId);
            dto.codeFlight = key.codeFlight;
            dto.arriveDate = key.arriveDate;
            dto.arriveTime = key.arriveTime;
            await repo.createPromotionRequest(dto);
        }
        public async Task createPromotionCancellationRequest(CancellationRequestDTO dto)
        {
            await repo.createPromotionCancellationRequest(dto);
        }
        public async Task<List<CancellationPromotionRequestResponseDTO>> getPendingCancellationPromotionRequests()
        {
            return await repo.getPendingCancellationPromotionRequests();
        }

        //Cancellation
        public async Task<List<TicketCancellationRequestResponseDTO>> getPendingTicketCancellationRequests()
        {
            return await repo.getPendingTicketCancellationRequests();
        }
        public async Task<TicketCancellationRequestResponseDTO> getTicketCancellationRequest(string id)
        {
            return await repo.getTicketCancellationRequest(id);
        }
        public async Task createTicketCancellationRequest(TicketCancellationRequestDTO dto)
        {
            await repo.createTicketCancellationRequest(dto);
        }
    }
}