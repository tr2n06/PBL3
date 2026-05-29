using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Pbl3.Services.Interface;
using Pbl3.Services.Interfaces;
using Pbl3.DTOs.Promotion;
using Pbl3.DTOs.Requests;
using Pbl3.Services.Implementations;
using System.IdentityModel.Tokens.Jwt;

namespace Pbl3.Controllers
{
    [ApiController]
    [Route("api/approvals")]
    public class RequestController : ControllerBase
    {
        private readonly IRequestService service;
        RequestController(IRequestService service)
        {
            this.service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetApprovalRequests()
        {
            try
            {
                var requests = await service.getPendingRequests();

                return Ok(requests);
            }
            catch (Exception)
            {
                return BadRequest("Error");
            }
        }

        [HttpPatch("{requestId}/approve")]
        public async Task<IActionResult> ApproveRequest([FromRoute] string requestId)
        {
            if (Request.Cookies.TryGetValue("jwt", out string token))
            {
                try
                {
                    var handler = new JwtSecurityTokenHandler();
                    var jwt = handler.ReadJwtToken(token);

                    var id = jwt.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
                    if (id == null) return BadRequest("Can't find this user");
                    var type = jwt.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
                    if (type == "Admin") return BadRequest("Can't find this user");
                    await service.acceptRequest(requestId, int.Parse(id));
                    return Ok("Successfull");
                }
                catch (Exception e)
                {
                    return BadRequest(e.ToString());
                }
            }
            else return BadRequest("Can't find this user");
        }

        [HttpPatch("{requestId}/reject")]
        public async Task<IActionResult> RejectRequest(RejectedRequestDTO dto)
        {
            if (Request.Cookies.TryGetValue("jwt", out string token))
            {
                try
                {
                    var handler = new JwtSecurityTokenHandler();
                    var jwt = handler.ReadJwtToken(token);

                    var id = jwt.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
                    if (id == null) return BadRequest("Can't find this user");
                    var type = jwt.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
                    if (type == "Admin") return BadRequest("Can't find this user");
                    dto.admin_id = int.Parse(id);
                    await service.rejectRequest(dto);
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