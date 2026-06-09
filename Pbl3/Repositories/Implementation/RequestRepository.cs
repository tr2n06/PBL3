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

namespace Pbl3.Repositories.Implementation
{
    public class RequestRepository : IRequestRepository
    {
        AppDbContext context;

        //Lưu ý cái services này là của Reposervice
        public RequestRepository(AppDbContext context)
        {
            this.context = context;
        }

        public async Task<List<RequestResponseDTO>> getPendingRequests()
        {
            var requests = await (from r in context.Requests
                                  where (r.status == "pending")
                                  select (new RequestResponseDTO
                                  {
                                      id = r.id,
                                      type = r.type,
                                      requesterId = r.requester_id?? 0,
                                      requesterName = r.requester != null ? r.requester.name : "Guest",
                                      requesterEmail = r.requester != null ? r.requester.email : "guest@example.com",
                                      requesterRole = (r.requester_id != null) ? ((r.requester_id < 50) ? "Staff" : "Customer") : "Customer",
                                      description = r.description?? "",
                                      status = r.status,
                                      createdAt = r.createAt.ToString("yyyy-MM-ddTHH:mm:ss"),
                                      reviewedAt = (r.reviewed_at != null) ? r.reviewed_at.ToString("yyyy-MM-ddTHH:mm:ss") : null,
                                      reviewedBy = r.reviewer_id,
                                      notes = r.note
                                  })).ToListAsync();
            return requests;

        }

        public async Task<string> getType(string id)
        {
            var r = await context.Requests.FirstOrDefaultAsync(re => re.id == id);
            if (r == null) throw new Exception("Not existed request");
            return r.type;
        }
        public async Task updateState(string id, string status, string? reason, int admin_id)
        {
            var r = await context.Requests.FirstOrDefaultAsync(r => r.id == id);
            if (r != null)
            {
                r.status = status;
                r.note = reason;
                r.reviewed_at = DateTime.Now;
                r.requester_id = admin_id;
                await context.SaveChangesAsync();
                return;
            }

            throw new Exception("Not existed request");
        }

        //profile_edit
        public async Task insertRequest(StaffRequestDTO dto)
        {
            var re = await context.StaffRequest.FirstOrDefaultAsync(r => r.requester_id == dto.id && r.status == "pending");
            if (re != null) throw new Exception("Existed Request");

            await context.StaffRequest.AddAsync(new StaffRequest
            {
                requester_id = dto.id,
                type = "profile_edit",
                description = "Profile edit request",
                address = dto.address,
                email = dto.email,
                status = "pending",
                phoneNumber = dto.phone,
                createAt = DateTime.Now

            });
            await context.SaveChangesAsync();
        }
        public async Task updateRequest(string id, string state)
        {
            var re = await context.StaffRequest.FirstOrDefaultAsync(r => r.id == id);
            if (re == null) throw new Exception("Not existed request");
            re.status = state;
            await context.SaveChangesAsync();
        }
        public async Task<StaffRequestResponseDTO> getRequest(int requester_id)
        {
            var re = await context.StaffRequest.FirstOrDefaultAsync(r => r.requester_id == requester_id && r.status == "pending");
            if (re == null) return null;
            var user = await context.User.FirstOrDefaultAsync(u => u.id == requester_id);
            return new StaffRequestResponseDTO
            {
                requestId = re.id,
                status = re.status,
                createdAt = re.createAt.ToString("yyyy-MM-ddTHH:mm:ss"),
                address = re.address,
                email = re.email,
                phone = re.phoneNumber,
                oldAddress = user?.address,
                oldEmail = user?.email,
                oldPhone = user?.phoneNumber
            };
        }
        public async Task<StaffRequestResponseDTO> getRequest(string id)
        {
            var re = await context.StaffRequest.FirstOrDefaultAsync(r => r.id == id);
            if (re == null) throw new Exception("Not existed request");
            var user = await context.User.FirstOrDefaultAsync(u => u.id == re.requester_id);
            return new StaffRequestResponseDTO
            {
                id = re.requester_id,
                requestId = re.id,
                status = re.status,
                createdAt = re.createAt.ToString("yyyy-MM-ddTHH:mm:ss"),
                address = re.address,
                email = re.email,
                phone = re.phoneNumber,
                oldAddress = user?.address,
                oldEmail = user?.email,
                oldPhone = user?.phoneNumber
            };
        }

        //promotion
        public async Task<List<PromotionRequestResponseDTO>> getPendingPromotionRequests()
        {
            var requests = await (from r in context.PromotionRequests
                                  where r.status == "pending"
                                  select (new PromotionRequestResponseDTO
                                  {
                                      id = r.id,
                                      flightNumber = r.codeFlight,
                                      flightId = r.codeFlight + "-" + r.departureDate.ToString("ddMMyyyy") + "-" + r.departureTime.ToString("HHmmss"),
                                      route = r.flight.fromTo.fromCity.fullName + " - " + r.flight.fromTo.toCity.fullName,
                                      discount = r.discount,
                                      reason = r.reason,
                                      status = r.status,
                                      createdAt = r.createAt.ToString("yyyy-MM-ddTHH:mm:ss")
                                  })).ToListAsync();
            return requests;
        }
        public async Task<PromotionRequestResponseDTO> getPromotionRequest(string id)
        {
            var request = await (from r in context.PromotionRequests
                                  where r.id == id
                                  select (new PromotionRequestResponseDTO
                                  {
                                      id = r.id,
                                      flightNumber = r.codeFlight,
                                      flightId = r.codeFlight + "-" + r.departureDate.ToString("ddMMyyyy") + "-" + r.departureTime.ToString("HHmmss"),
                                      route = r.flight.fromTo.fromCity.fullName + " - " + r.flight.fromTo.toCity.fullName,
                                      discount = r.discount,
                                      reason = r.reason,
                                      status = r.status,
                                      createdAt = r.createAt.ToString("yyyy-MM-ddTHH:mm:ss")
                                  })).FirstOrDefaultAsync();
            return request;
        }
        public async Task createPromotionRequest(CreatePromotionRequestDTO dto)
        {
            await context.AddAsync(new PromotionRequest
            {
                requester_id = dto.requester_id,
                type = "promotion",
                description = dto.reason ?? "Promotion request",
                status = "pending",
                reason = dto.reason,
                codeFlight = dto.codeFlight?? "VN0000",
                departureDate = DateOnly.Parse(dto.departureDate?? "2026-05-29"),
                departureTime = TimeOnly.Parse(dto.departureTime?? "00:00:00"),
                discount = dto.discount,
                createAt = DateTime.Now
            });
            await context.SaveChangesAsync();
        }
        public async Task createPromotionCancellationRequest(CancellationRequestDTO dto)
        {
            await context.AddAsync(new PromotionCancelRequest
            {
                requester_id = dto.requester_id,
                type = "cancelPromotion",
                description = dto.reason ?? "Promotion cancellation request",
                status = "pending",
                reason = dto.reason,
                promotion_id = dto.promotionId,
                createAt = DateTime.Now
            });
            await context.SaveChangesAsync();
        }
        public async Task<List<CancellationPromotionRequestResponseDTO>> getPendingCancellationPromotionRequests()
        {
            var requests = await (from r in context.PromotionCancelRequests
                                  where r.status == "pending"
                                  select (new CancellationPromotionRequestResponseDTO
                                  {
                                      id = r.id,
                                      flightNumber = r.promotion.codeFlight,
                                      route = r.promotion.flight.fromTo.fromCity.fullName + " - " + r.promotion.flight.fromTo.toCity.fullName,
                                      reason = r.reason,
                                      status = r.status,
                                      createdAt = r.createAt.ToString("yyyy-MM-ddTHH:mm:ss")
                                  })).ToListAsync();
            return requests;
        }
        public async Task<CancellationPromotionRequestResponseDTO> getCancelPromotionRequest(string id)
        {
            var request = await (from r in context.PromotionCancelRequests
                                  where r.id == id
                                  select (new CancellationPromotionRequestResponseDTO
                                  {
                                      id = r.id,
                                      promotionId = r.promotion_id,
                                      flightNumber = r.promotion.codeFlight,
                                      route = r.promotion.flight.fromTo.fromCity.fullName + " - " + r.promotion.flight.fromTo.toCity.fullName,
                                      reason = r.reason,
                                      status = r.status,
                                      createdAt = r.createAt.ToString("yyyy-MM-ddTHH:mm:ss")
                                  })).FirstOrDefaultAsync();
            return request;
        }

        //Cancellation
        public async Task<List<TicketCancellationRequestResponseDTO>> getPendingTicketCancellationRequests()
        {
            var requests = await (from r in context.CancelRequest
                                 where (r.status == "pending")
                                 select new TicketCancellationRequestResponseDTO
                                 {
                                     id = r.id,
                                     ticketId = r.codeTicket,
                                     reason = r.reason,
                                     status = r.status,
                                     createdAt = r.createAt.ToString("yyyy-MM-ddTHH:mm:ss")
                                 }).ToListAsync();
            return requests;
        }
        public async Task<TicketCancellationRequestResponseDTO> getTicketCancellationRequest(string id)
        {
            var request = await (from r in context.CancelRequest
                                 where (r.id == id)
                                 select new TicketCancellationRequestResponseDTO
                                 {
                                     id = r.id,
                                     ticketId = r.codeTicket,
                                     reason = r.reason,
                                     status = r.status,
                                     createdAt = r.createAt.ToString("yyyy-MM-ddTHH:mm:ss")
                                 }).FirstOrDefaultAsync();
            return request;
        }
        public async Task createTicketCancellationRequest(TicketCancellationRequestDTO dto)
        {
            await context.CancelRequest.AddAsync(new CancelRequest
            {
                requester_id = dto.requester_id,
                type = "cancellation",
                description = dto.reason ?? "Ticket cancellation request",
                status = "pending",
                reason = dto.reason,
                codeTicket = dto.ticketId,
                createAt = DateTime.Now
            });
            await context.SaveChangesAsync();
        }

        public async Task<bool> isTicketCancellationRequested(string ticketId)
        {
            return await context.CancelRequest.AnyAsync(r => r.codeTicket == ticketId && r.status == "pending");
        }
    }
}