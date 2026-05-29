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

        public TicketController(ITicketService service, IRequestService requestService)
        {
            this.service = service;
            this.requestService = requestService;
        }

        [HttpGet("my")]
        public IActionResult GetMyTickets()
        {
            if (Request.Cookies.TryGetValue("jwt", out string token))
            {
                try
                {
                    var handler = new JwtSecurityTokenHandler();
                    var jwt = handler.ReadJwtToken(token);

                    var id = jwt.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
                    if (id == null) return BadRequest("Can't find this user");
                    int userId = int.Parse(id);
                    var tickets = service.getMyTickets(userId);

                    if (tickets == null) return Unauthorized("Invalid");
                    return Ok(tickets);
                }
                catch (Exception e)
                {
                    return BadRequest(e.ToString());
                }

            }
            else return BadRequest("Can't find this user");
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
                return BadRequest(e.ToString());
            }
        }

        [HttpPost("{ticketId}/cancellation-request")]
        public async Task<ActionResult> RequestTicketCancellation([FromBody] TicketCancellationRequestDTO dto)
        {
            if (Request.Cookies.TryGetValue("jwt", out string token))
            {
                try
                {
                    var handler = new JwtSecurityTokenHandler();
                    var jwt = handler.ReadJwtToken(token);

                    var id = jwt.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
                    if (id == null) return BadRequest("Can't find this user");
                    dto.requester_id = int.Parse(id);
                    var type = jwt.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
                    if (type == "Staff") return BadRequest("Can't find this user");
                    await requestService.createTicketCancellationRequest(dto);
                    return Ok("Successfull");
                }
                catch (Exception e)
                {
                    return BadRequest(e.ToString());
                }
            }
            else return BadRequest("Can't find this user");
        }
    }
}