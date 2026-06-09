using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Pbl3.DataAccess.Data;
using Pbl3.DataAccess.Models.Users;
using Pbl3.DTOs.Bookings;
using Pbl3.DTOs.Requests;
using Pbl3.DTOs.Baggage;
using Pbl3.Services.Implementation;
using Pbl3.Services.Interface;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using Pbl3.Services.Implementations;

namespace Pbl3.Controllers
{
    [Route("api/tickets")]
    [ApiController]
    public class TicketController : ControllerBase
    {
        private readonly ITicketService service;
        private readonly IRequestService requestService;
        private readonly IBaggageService baggageService;

        public TicketController(ITicketService service, IRequestService requestService, IBaggageService baggageService)
        {
            this.service = service;
            this.requestService = requestService;
            this.baggageService = baggageService;
        }

        [HttpGet]
        public async Task<ActionResult<List<TicketDTO>>> GetAllTickets()
        {
            try
            {
                var tickets = await service.getAllTickets();
                return Ok(tickets);
            }
            catch (Exception e)
            {
                return BadRequest(new { message = e.ToString() });
            }
        }

        [HttpGet("my")]
        public async Task<ActionResult> GetMyTickets()
        {
            if (Request.Cookies.TryGetValue("jwt", out string token))
            {
                try
                {
                    var handler = new JwtSecurityTokenHandler();
                    var jwt = handler.ReadJwtToken(token);

                    var id = jwt.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
                    if (id == null) return BadRequest(new { message = "Can't find this user"});
                    int userId = int.Parse(id);
                    var tickets = await service.getMyTickets(userId);

                    if (tickets == null) return Unauthorized(new { message = "Invalid"});
                    return Ok(tickets);
                }
                catch (Exception e)
                {
                    return BadRequest(e.ToString());
                }

            }
            else return BadRequest(new { message = "Can't find this user"});
        }

        [HttpGet("{ticketId}")]
        public async Task<ActionResult<TicketResponseDTO>> GetTicketDetail([FromRoute] string ticketId)
        {
            try
            {
                return Ok(await service.getTicket(ticketId));
            }
            catch (Exception e)
            {
                return BadRequest(new { message = e.ToString()});
            }
        }

        [HttpGet("booking/{bookingRef}")]
        public async Task<ActionResult> GetTicketsByBookingCode([FromRoute] string bookingRef)
        {
            try
            {
                var tickets = await service.getTicketsListByBookingCode(bookingRef);
                return Ok(tickets);
            }
            catch (Exception e)
            {
                return BadRequest(new { message = e.ToString() });
            }
        }

        [HttpPost("{ticketId}/cancellation-request")]
        public async Task<ActionResult> RequestTicketCancellation([FromRoute] string ticketId, [FromBody] TicketCancellationRequestDTO dto)
        {
            dto.ticketId = ticketId;
            if (Request.Cookies.TryGetValue("jwt", out string token))
            {
                try
                {
                    var handler = new JwtSecurityTokenHandler();
                    var jwt = handler.ReadJwtToken(token);

                    var id = jwt.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
                    if (id != null)
                    {
                        dto.requester_id = int.Parse(id);
                        var type = jwt.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
                        if (type == "Admin") return BadRequest(new { message = "Can't find this user"});
                    }
                    else
                    {
                        dto.requester_id = null;
                    }
                }
                catch (Exception)
                {
                    dto.requester_id = null;
                }
            }
            else
            {
                dto.requester_id = null;
            }

            try
            {
                await requestService.createTicketCancellationRequest(dto);
                return Ok(new { message = "Successfull" });
            }
            catch (Exception e)
            {
                return BadRequest(e.ToString());
            }
        }

        [HttpPost("{ticketId}/baggage")]
        public async Task<IActionResult> AddTicketBaggage([FromRoute] string ticketId, [FromBody] AddBaggageRequestDTO dto)
        {
            try
            {
                var baggageDto = new BaggageRequestDTO
                {
                    codeTicket = ticketId,
                    weight = dto.ExtraCheckedKg,
                    type = "checked",
                    status = "confirmed",
                    codeTransaction = dto.CodeTransaction
                };
                if (string.IsNullOrWhiteSpace(baggageDto.codeTransaction))
                {
                    return BadRequest(new { success = false, message = "Missing payment transaction" });
                }
                await baggageService.insertBaggage(baggageDto);

                // Reward points based on the extra baggage amount paid (amount / 1000000)
                if (dto.Amount > 0)
                {
                    int? userId = await service.GetUserIdByTicketIdAsync(ticketId);
                    if (userId.HasValue && userId.Value >= 51)
                    {
                        int pointsEarned = (int)(dto.Amount / 1000000);
                        if (pointsEarned > 0)
                        {
                            await service.AddPointsAsync(userId.Value, pointsEarned);
                        }
                    }
                }

                return Ok(new { success = true, message = "Baggage added successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("{ticketId}/upgrade")]
        public async Task<IActionResult> UpgradeTicket([FromRoute] string ticketId, [FromBody] UpgradeTicketRequestDTO dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.CodeTransaction))
                {
                    return BadRequest(new { success = false, message = "Missing payment transaction" });
                }
                await service.upgradeTicket(ticketId, dto);
                return Ok(new { success = true, message = "Ticket upgraded successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("{ticketId}/is-cancellation-requested")]
        public async Task<ActionResult<bool>> IsCancellationRequested([FromRoute] string ticketId)
        {
            try
            {
                var isRequested = await requestService.isTicketCancellationRequested(ticketId);
                return Ok(isRequested);
            }
            catch (Exception e)
            {
                return BadRequest(new { message = e.ToString() });
            }
        }
    }

    public class AddBaggageRequestDTO
    {
        public string TicketId { get; set; }
        public int ExtraCheckedKg { get; set; }
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; }
        public string? CodeTransaction { get; set; }
    }
}
