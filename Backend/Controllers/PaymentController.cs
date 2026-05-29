using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Concurrent;
using System.Net;
using System.Net.Sockets;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace Pbl3.Controllers
{
    public class OrderRequest
    {
        public long Amount { get; set; }
        public string OrderInfo { get; set; }
    }

    public class ConfirmPaymentRequest
    {
        public string OrderId { get; set; }
        public string BankName { get; set; }
        public string AccountNumber { get; set; }
        public string AccountName { get; set; }
        public long Amount { get; set; }
    }

    public class OrderStatus
    {
        public string OrderId { get; set; }
        public long Amount { get; set; }
        public bool IsPaid { get; set; }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class PaymentController : ControllerBase
    {
        private static readonly ConcurrentDictionary<string, OrderStatus> Orders = new();
        private readonly IConfiguration _configuration;

        public PaymentController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        private string GetLocalIPAddress()
        {
            try
            {
                using (Socket socket = new Socket(AddressFamily.InterNetwork, SocketType.Dgram, 0))
                {
                    socket.Connect("8.8.8.8", 65530);
                    IPEndPoint endPoint = socket.LocalEndPoint as IPEndPoint;
                    return endPoint?.Address.ToString() ?? "localhost";
                }
            }
            catch
            {
                return "localhost";
            }
        }

        // 1. API Tạo đơn hàng và sinh link QR tự động theo IP máy
        [HttpPost("create-order")]
        public IActionResult CreateOrder([FromBody] OrderRequest request)
        {
            string localIp = GetLocalIPAddress();
            // Link QR sẽ hướng về cổng Frontend 3000 (nơi host trang giả lập /payment-simulator)
            string publicUrl = $"http://{localIp}:3000";

            string orderId = "DH_" + DateTime.UtcNow.Ticks;

            // Đăng ký đơn hàng vào bộ nhớ tạm
            Orders[orderId] = new OrderStatus { OrderId = orderId, Amount = request.Amount, IsPaid = false };

            string qrLink = $"{publicUrl}/payment-simulator?orderId={orderId}&amount={request.Amount}&info={Uri.EscapeDataString(request.OrderInfo)}";

            return Ok(new { orderId, qrLink });
        }

        // 2. API nhận phản hồi xác nhận thanh toán từ simulator
        [HttpPost("confirm-payment")]
        public IActionResult ConfirmPayment([FromBody] ConfirmPaymentRequest request)
        {
            if (Orders.TryGetValue(request.OrderId, out var order))
            {
                if (order.IsPaid)
                {
                    return BadRequest(new { success = false, message = "Đơn hàng này đã được thanh toán trước đó!" });
                }

                order.IsPaid = true;

                Console.WriteLine($"[SUCCESS] Đơn hàng {request.OrderId} đã thanh toán thành công!");
                Console.WriteLine($"Ngân hàng: {request.BankName} | STK: {request.AccountNumber} | Chủ TK: {request.AccountName} | Số tiền: {request.Amount}");

                return Ok(new { success = true, message = "Backend đã nhận thông tin thanh toán thành công!" });
            }

            return NotFound(new { success = false, message = "Đơn hàng không tồn tại trên hệ thống!" });
        }

        // 3. API Kiểm tra trạng thái đơn hàng (Polling)
        [HttpGet("check-status/{orderId}")]
        public IActionResult CheckStatus(string orderId)
        {
            if (Orders.TryGetValue(orderId, out var order))
            {
                return Ok(new { exists = true, isPaid = order.IsPaid });
            }
            return Ok(new { exists = false, isPaid = false });
        }

        // 3.5. API Lấy danh sách ngân hàng hoạt động từ SQL Server
        [HttpGet("banks")]
        public IActionResult GetBanks()
        {
            string connectionString = _configuration.GetConnectionString("DefaultConnection");
            var banks = new System.Collections.Generic.List<string>();

            try
            {
                using (var connection = new SqlConnection(connectionString))
                {
                    connection.Open();
                    var cmd = connection.CreateCommand();
                    cmd.CommandText = "SELECT DISTINCT BankName FROM Accounts;";

                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            banks.Add(reader.GetString(0));
                        }
                    }
                }
                return Ok(banks);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi kết nối cơ sở dữ liệu SQL Server: {ex.Message}" });
            }
        }

        // 4. API Lấy tên chủ tài khoản dựa trên số tài khoản và ngân hàng thụ hưởng từ SQL Server
        [HttpGet("get-account-name")]
        public IActionResult GetAccountName([FromQuery] string accountNumber, [FromQuery] string bankName)
        {
            if (string.IsNullOrEmpty(accountNumber) || string.IsNullOrEmpty(bankName))
            {
                return BadRequest(new { success = false, message = "Số tài khoản và ngân hàng không được để trống!" });
            }

            string connectionString = _configuration.GetConnectionString("DefaultConnection");

            try
            {
                using (var connection = new SqlConnection(connectionString))
                {
                    connection.Open();
                    var cmd = connection.CreateCommand();
                    cmd.CommandText = "SELECT TOP 1 AccountName FROM Accounts WHERE AccountNumber = @accNum AND BankName = @bankName;";
                    cmd.Parameters.AddWithValue("@accNum", accountNumber.Trim());
                    cmd.Parameters.AddWithValue("@bankName", bankName.Trim());

                    using (var reader = cmd.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            string accountName = reader.GetString(0);
                            return Ok(new { success = true, accountName });
                        }
                    }
                }
                return NotFound(new { success = false, message = "Không tìm thấy thông tin tài khoản hợp lệ!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi kết nối cơ sở dữ liệu SQL Server: {ex.Message}" });
            }
        }
    }
}
