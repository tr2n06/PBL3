using Microsoft.AspNetCore.Mvc;
using MockPaymentApi.Models;
using System;
using System.Net;
using System.Net.Sockets;

namespace MockPaymentApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentController : ControllerBase
    {
        // 1. API Tạo đơn hàng và sinh link QR tự động theo IP máy
        [HttpPost("create-order")]
        public IActionResult CreateOrder([FromBody] OrderRequest request)
        {
            // 1. DÁN CÁI LINK BẠN VỪA COPY Ở BƯỚC 1 VÀO ĐÂY (Nhớ bỏ dấu / ở cuối link nếu có)
            string publicUrl = "https://btl-thanh-toan-vjp.loca.lt";

            string orderId = "DH_" + DateTime.UtcNow.Ticks;

            // 2. Đường link QR bây giờ sẽ chạy qua Internet công khai
            string qrLink = $"{publicUrl}/checkout?orderId={orderId}&amount={request.Amount}&info={Uri.EscapeDataString(request.OrderInfo)}";

            return Ok(new { orderId, qrLink });
        }

        // 2. API nhận phản hồi từ điện thoại quét mã gửi về
        [HttpPost("confirm-payment")]
        public IActionResult ConfirmPayment([FromBody] ConfirmPaymentRequest request)
        {
            // Ở đây bạn có thể log ra console hoặc cập nhật DB trạng thái Đã Thanh Toán
            Console.WriteLine($"[SUCCESS] Đơn hàng {request.OrderId} đã thanh toán thành công!");
            Console.WriteLine($"Ngân hàng: {request.BankName} | STK: {request.AccountNumber} | Chủ TK: {request.AccountName} | Số tiền: {request.Amount}");

            return Ok(new { success = true, message = "Backend đã nhận thông tin thanh toán thành công!" });
        }
    }
}