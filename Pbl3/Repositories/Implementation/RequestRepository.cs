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
                                      requesterName = r.requester.name,
                                      requesterEmail = r.requester.email,
                                      requesterRole = (r.requester_id != null) ? ((r.requester_id < 50) ? "Staff" : "Customer") : "Customer",
                                      description = r.description?? "",
                                      status = r.status,
                                      createdAt = r.createAt.ToString("dd/MM/yyyy HH:mm:ss"),
                                      reviewedAt = (r.reviewed_at != null) ? r.reviewed_at.ToString("dd/MM/yyyy HH:mm:ss") : null,
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
            }

            throw new Exception("Not existed request");
        }

        //profile_edit
        public async Task insertRequest(StaffRequestDTO dto)
        {
            var re = await context.StaffRequest.FirstOrDefaultAsync(r => r.requester_id == dto.id);
            if (re != null) throw new Exception("Existed Request");

            await context.StaffRequest.AddAsync(new StaffRequest
            {
                requester_id = dto.id,
                type = "profile_edit",
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
            if (re != null) throw new Exception("Not existed request");
            re.status = state;
            await context.SaveChangesAsync();
        }
        public async Task<StaffRequestResponseDTO> getRequest(int requester_id)
        {
            var re = await context.StaffRequest.FirstOrDefaultAsync(r => r.requester_id == requester_id);
            if (re != null) throw new Exception("Not existed request");
            return new StaffRequestResponseDTO
            {
                requestId = re.id,
                status = re.status,
                createdAt = re.createAt.ToString("dd/MM/yyyyHH:mm:ss"),
                address = re.address,
                email = re.email,
                phone = re.phoneNumber
            };
        }
        public async Task<StaffRequestResponseDTO> getRequest(string id)
        {
            var re = await context.StaffRequest.FirstOrDefaultAsync(r => r.id == id);
            if (re != null) throw new Exception("Not existed request");
            return new StaffRequestResponseDTO
            {
                id = re.requester_id,
                requestId = re.id,
                status = re.status,
                createdAt = re.createAt.ToString("dd/MM/yyyyHH:mm:ss"),
                address = re.address,
                email = re.email,
                phone = re.phoneNumber
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
                                      flightId = r.codeFlight + r.arriveDate.ToString("ddMMyyyy") + r.arriveTime.ToString(@"hhmmss"),
                                      route = r.flight.fromTo.fromCity.fullName + " - " + r.flight.fromTo.toCity.fullName,
                                      discount = r.discount,
                                      reason = r.reason,
                                      status = r.status,
                                      createdAt = r.createAt.ToString("dd/MM/yyyy")
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
                                      flightId = r.codeFlight + r.arriveDate.ToString("ddMMyyyy") + r.arriveTime.ToString(@"hhmmss"),
                                      route = r.flight.fromTo.fromCity.fullName + " - " + r.flight.fromTo.toCity.fullName,
                                      discount = r.discount,
                                      reason = r.reason,
                                      status = r.status,
                                      createdAt = r.createAt.ToString("dd/MM/yyyy")
                                  })).FirstOrDefaultAsync();
            return request;
        }
        public async Task createPromotionRequest(CreatePromotionRequestDTO dto)
        {
            await context.AddAsync(new PromotionRequest
            {
                requester_id = dto.requester_id,
                type = "promotion",
                status = "pending",
                reason = dto.reason,
                codeFlight = dto.codeFlight?? "VN0000",
                arriveDate = dto.arriveDate?? DateOnly.FromDateTime(DateTime.Now),
                arriveTime = dto.arriveTime?? TimeOnly.FromDateTime(DateTime.Now),
                discount = dto.discount,
                createAt = DateTime.Now
            });
        }
        public async Task createPromotionCancellationRequest(CancellationRequestDTO dto)
        {
            await context.AddAsync(new PromotionCancelRequest
            {
                requester_id = dto.requester_id,
                type = "cancelPromotion",
                status = "pending",
                reason = dto.reason,
                promotion_id = dto.promotionId,
                createAt = DateTime.Now
            });
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
                                      createdAt = r.createAt.ToString("dd/MM/yyyy")
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
                                      createdAt = r.createAt.ToString("dd/MM/yyyy")
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
                                     createdAt = r.createAt.ToString("dd/MM/yyyy")
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
                                     createdAt = r.createAt.ToString("dd/MM/yyyy")
                                 }).FirstOrDefaultAsync();
            return request;
        }
        public async Task createTicketCancellationRequest(TicketCancellationRequestDTO dto)
        {
            await context.CancelRequest.AddAsync(new CancelRequest
            {
                requester_id = dto.requester_id,
                type = "cancellation",
                status = "pending",
                reason = dto.reason,
                codeTicket = dto.ticketId,
                createAt = DateTime.Now
            });
            await context.SaveChangesAsync();
        }
    }
}