using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Pbl3.DTOs.Bookings;
using Pbl3.Services.Interface;

namespace Pbl3.Controllers
{
    [Route("api/payments")]
    [ApiController]
    public class PaymentsController : ControllerBase
    {
        private readonly IPaymentService _paymentService;

        public PaymentsController(IPaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        // 1. API Checkout - complete payment (Cash, Card, QR)
        [HttpPost("complete")]
        public async Task<IActionResult> CompletePayment([FromBody] CompletePaymentRequestDTO request)
        {
            try
            {
                int? userId = null;
                string userType = null;
                if (Request.Cookies.TryGetValue("jwt", out string token))
                {
                    try
                    {
                        var handler = new JwtSecurityTokenHandler();
                        var jwt = handler.ReadJwtToken(token);
                        var idClaim = jwt.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
                        if (idClaim != null)
                        {
                            userId = int.Parse(idClaim);
                        }
                        var typeClaim = jwt.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
                        if (typeClaim != null)
                        {
                            userType = typeClaim;
                        }
                    }
                    catch (Exception)
                    {
                        // Proceed as guest if JWT is invalid or missing claims
                    }
                }

                var result = await _paymentService.ProcessPaymentCompleteAsync(request, userId, userType, Request.Host.Host);
                return Ok(result);
            }
            catch (Exception ex)
            {
                LogException("CompletePayment", ex);
                Console.WriteLine($"[ERROR] CompletePayment: {ex}");
                var msg = ex.InnerException != null ? $"{ex.Message} | Inner: {ex.InnerException.Message}" : ex.Message;
                return BadRequest(new { success = false, message = msg });
            }
        }

        // 2. API Confirm Payment (Hits from Mock Checkout Gateway app)
        // Maps both 'api/payments/confirm-payment' and the raw 'api/payment/confirm-payment' from the mock demo app.
        [HttpPost("confirm-payment")]
        [HttpPost("/api/payment/confirm-payment")]
        public async Task<IActionResult> ConfirmPayment([FromBody] ConfirmPaymentCallbackRequest request)
        {
            try
            {
                var result = await _paymentService.ConfirmPaymentAsync(
                    request.OrderId,
                    request.BankName,
                    request.AccountNumber,
                    request.AccountName,
                    request.Amount
                );
                return Ok(result);
            }
            catch (Exception ex)
            {
                LogException("ConfirmPayment", ex);
                Console.WriteLine($"[ERROR] ConfirmPayment: {ex}");
                var msg = ex.InnerException != null ? $"{ex.Message} | Inner: {ex.InnerException.Message}" : ex.Message;
                return BadRequest(new { success = false, message = msg });
            }
        }

        // 3. API Check Payment/Booking Status
        [HttpGet("status/{bookingRef}")]
        public async Task<IActionResult> CheckStatus(string bookingRef)
        {
            try
            {
                var status = await _paymentService.CheckBookingStatusAsync(bookingRef);
                return Ok(new { status = status });
            }
            catch (Exception ex)
            {
                LogException("CheckStatus", ex);
                Console.WriteLine($"[ERROR] CheckStatus: {ex}");
                var msg = ex.InnerException != null ? $"{ex.Message} | Inner: {ex.InnerException.Message}" : ex.Message;
                return BadRequest(new { success = false, message = msg });
            }
        }

        // 4. API Confirm Direct Success Payment (Card, Cash, QR Success)
        [HttpPost("confirm-success")]
        public async Task<IActionResult> ConfirmSuccessPayment([FromBody] PaymentConfirmSuccessRequestDTO request)
        {
            try
            {
                var result = await _paymentService.ConfirmSuccessPaymentAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                LogException("ConfirmSuccessPayment", ex);
                Console.WriteLine($"[ERROR] ConfirmSuccessPayment: {ex}");
                var msg = ex.InnerException != null ? $"{ex.Message} | Inner: {ex.InnerException.Message}" : ex.Message;
                return BadRequest(new { success = false, message = msg });
            }
        }

        [HttpPost("ticket-action")]
        public async Task<IActionResult> InitiateTicketActionPayment([FromBody] TicketActionPaymentRequestDTO request)
        {
            try
            {
                var result = await _paymentService.InitiateTicketActionPaymentAsync(request, Request.Host.Host);
                return Ok(result);
            }
            catch (Exception ex)
            {
                LogException("InitiateTicketActionPayment", ex);
                var msg = ex.InnerException != null ? $"{ex.Message} | Inner: {ex.InnerException.Message}" : ex.Message;
                return BadRequest(new { success = false, message = msg });
            }
        }

        [HttpPost("ticket-action/confirm")]
        public async Task<IActionResult> ConfirmTicketActionPayment([FromBody] TicketActionPaymentConfirmDTO request)
        {
            try
            {
                var result = await _paymentService.ConfirmTicketActionPaymentAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                LogException("ConfirmTicketActionPayment", ex);
                var msg = ex.InnerException != null ? $"{ex.Message} | Inner: {ex.InnerException.Message}" : ex.Message;
                return BadRequest(new { success = false, message = msg });
            }
        }

        private void LogException(string context, Exception ex)
        {
            try
            {
                var logMsg = $"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss}] ERROR in {context}: {ex}\n";
                if (ex.InnerException != null)
                {
                    logMsg += $"Inner Exception: {ex.InnerException}\n";
                }
                logMsg += "--------------------------------------------------\n";
                System.IO.File.AppendAllText("backend_error.log", logMsg);
            }
            catch { }
        }
    }

    public class ConfirmPaymentCallbackRequest
    {
        public string OrderId { get; set; }
        public string BankName { get; set; }
        public string AccountNumber { get; set; }
        public string AccountName { get; set; }
        public long Amount { get; set; }
    }
}
