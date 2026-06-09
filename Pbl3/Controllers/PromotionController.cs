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
    [Route("api/promotions")]
    public class PromotionController : ControllerBase
    {
        private readonly IPromotionService _service;
        private readonly IRequestService requestService;

        public PromotionController(IPromotionService service, IRequestService requestService)
        {
            this.requestService = requestService;
            _service = service;
        }

        [HttpGet("active")]
        public async Task<ActionResult> GetActive()
        {
            try
            {
                return Ok(await _service.GetActivePromotions());
            }
            catch(Exception e)
            {
                return BadRequest(new { message = "Fail to get active promotion list"});
            }
        }

        [HttpGet("candidates")]
        public async Task<ActionResult> GetCandidates()
        {
            try
            {
                return Ok(await _service.GetCandidates());
            }
            catch(Exception e)
            {
                return BadRequest(new { message = "Fail to get candidate list for promotion"});
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id)
        {
            try
            {
                return Ok(await _service.DeletePromotion(id));
            }
            catch(Exception e)
            {
                return BadRequest(new { message = "Fail to delete promotion"});
            }
        }

        [HttpGet("requests/my")]
        public async Task<IActionResult> GetMyRequests()
        {
            try
            {
                return Ok(await requestService.getPendingPromotionRequests());
            }
            catch (Exception e)
            {
                return BadRequest(new { message = e.ToString()});
            }
        }

        [HttpPost("requests")]
        public async Task<IActionResult> createPromotionRequest(CreatePromotionRequestDTO dto)
        {
            if (Request.Cookies.TryGetValue("jwt", out string token))
            {
                try
                {
                    var handler = new JwtSecurityTokenHandler();
                    var jwt = handler.ReadJwtToken(token);

                    var id = jwt.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
                    if (id == null) return BadRequest(new { message = "Can't find this user"});
                    dto.requester_id = int.Parse(id);
                    var type = jwt.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
                    if (type != "Staff") return BadRequest(new { message = "Can't find this user"});
                    await requestService.createPromotionRequest(dto);
                    return Ok(new { message = "Successfull"});
                }
                catch (Exception e)
                {
                    return BadRequest(new { message = e.ToString()});
                }
            }
            else return BadRequest(new { message = "Can't find this user"});
        }

        [HttpPost("cancellation-requests")]
        public async Task<IActionResult> createCancellationPromotionRequest(CancellationRequestDTO dto)
        {
            if (Request.Cookies.TryGetValue("jwt", out string token))
            {
                try
                {
                    var handler = new JwtSecurityTokenHandler();
                    var jwt = handler.ReadJwtToken(token);

                    var id = jwt.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
                    if (id == null) return BadRequest(new { message = "Can't find this user"});
                    dto.requester_id = int.Parse(id);
                    var type = jwt.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
                    if (type != "Staff") return BadRequest(new { message = "Can't find this user"});
                    await requestService.createPromotionCancellationRequest(dto);
                    return Ok(new { message = "Successfull"});
                }
                catch (Exception e)
                {
                    return BadRequest(new { message = e.ToString()});
                }
            }
            else return BadRequest(new { message = "Can't find this user"});
        }

        [HttpGet("cancellation-requests/my")]
        public async Task<IActionResult> GetMyCancellationRequests()
        {
            try
            {
                return Ok(await requestService.getPendingCancellationPromotionRequests());
            }
            catch (Exception e)
            {
                return BadRequest(new { message = e.ToString()});
            }
        }
    }
}