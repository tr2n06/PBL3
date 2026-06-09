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
        IMailService mailService;

        public async Task<List<RequestResponseDTO>> getPendingRequests()
        {
            var requests = await repo.getPendingRequests();
            foreach (var r in requests)
            {
                switch (r.type)
                {
                    case "profile_edit":
                        var request = await repo.getRequest(r.id);
                        r.data = new profile_editData
                        {
                            id = request.id ?? 0,
                            address = request.address,
                            email = request.email,
                            phone = request.phone,
                            oldAddress = request.oldAddress,
                            oldEmail = request.oldEmail,
                            oldPhone = request.oldPhone
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
                        r.type = "promotion";
                        r.data = new cancelPromotionData
                        {
                            promotionId = cpr.promotionId,
                            flightNumber = cpr.flightNumber,
                            reason = cpr.reason
                        };
                        break;
                    case "cancellation":
                        var ct = await repo.getTicketCancellationRequest(r.id);
                        if (ct != null)
                        {
                            r.data = new cancellationData
                            {
                                ticketCode = ct.ticketId,
                                reason = ct.reason
                            };
                        }
                        break;
                    default:
                        throw new Exception("Invalid type");
                }
            }
            return requests;

        }
        public RequestService(IRequestRepository repo, IAuthService authService, ITicketService ticketService, IFlightService flightService, IPromotionService promotionService, IMailService mailService)
        {
            this.repo = repo;
            this.authService = authService;
            this.ticketService = ticketService;
            this.flightService = flightService;
            this.promotionService = promotionService;
            this.mailService = mailService;
        }
        public async Task acceptRequest(string request_id, int admin_id)
        {
            var type = await repo.getType(request_id);
            switch (type)
            {
                case "profile_edit":
                    var request = await repo.getRequest(request_id);
                    await authService.updateUser(new UpdateUserDTO
                    {
                        id = request.id ?? 0,
                        address = request.address,
                        email = request.email,
                        phone = request.phone,
                        status = "active"
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
                    var ticket = await ticketService.getTicket(ct.ticketId);

                    await ticketService.updateTicket(new TicketRequestDTO
                    {
                        codeTicket = ct.ticketId,
                        state = "cancelled"
                    }); 

                    if (ticket != null && !string.IsNullOrEmpty(ticket.passengerEmail))
                    {
                        await mailService.SendMail(
                            ticket.passengerEmail,
                            "Thông báo hủy vé máy bay thành công",
                            $@"
                            <div style='font-family: Arial, sans-serif; line-height:1.8; color:#333'>
                                <h2 style='color:#d9534f;'>Thông báo hủy vé máy bay</h2>
                                <p>Kính gửi quý khách {ticket.passengerName},</p>
                                <p>Chúng tôi xin thông báo yêu cầu hủy vé máy bay của quý khách đã được phê duyệt thành công.</p>
                                <div style='background-color:#f8f9fa;padding:15px;border-radius:5px;margin:20px 0'>
                                    <p><b>Mã vé:</b> {ticket.id}</p>
                                    <p><b>Mã đặt chỗ (Booking Ref):</b> {ticket.bookingRef}</p>
                                    <p><b>Chuyến bay:</b> {ticket.flight?.flightNumber}</p>
                                    <p><b>Hành trình:</b> {ticket.flight?.departure?.city} &rarr; {ticket.flight?.arrival?.city}</p>
                                    <p><b>Giá vé hoàn trả:</b> {ticket.totalPrice.ToString("N0")} VND</p>
                                </div>
                                <p>Số tiền hoàn trả sẽ được chuyển vào tài khoản thanh toán ban đầu của quý khách trong vòng 2-3 ngày làm việc.</p>
                                <p>Cảm ơn quý khách đã tin tưởng dịch vụ của Skylines Airlines.</p>
                                <br/>
                                <p>Trân trọng,<br/><b>Skylines Airlines</b></p>
                            </div>"
                        );
                    }
                    break;
                default:
                    throw new Exception("Invalid type");
            }
            await repo.updateState(request_id, "approved", null, admin_id);
        }
        public async Task rejectRequest(RejectedRequestDTO dto)
        {
            var type = await repo.getType(dto.requestId);
            if (type == "profile_edit")
            {
                var request = await repo.getRequest(dto.requestId);
                await authService.updateStateUser(request.id ?? 0, "active");
            }
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
            dto.departureDate = (key.departureDate?? DateOnly.FromDateTime(DateTime.Parse("0000-00-00T00:00:00"))).ToString("yyyy-MM-dd");
            dto.departureTime = (key.departureTime?? TimeOnly.FromDateTime(DateTime.Parse("0000-00-00T00:00:00"))).ToString("HH:mm:ss");
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
        public async Task<bool> isTicketCancellationRequested(string ticketId)
        {
            return await repo.isTicketCancellationRequested(ticketId);
        }
    }
}