using Microsoft.AspNetCore.Mvc;
using MockPaymentApi.Models;
using System;
using System.Collections.Concurrent;
using System.Net;
using System.Net.Sockets;

namespace MockPaymentApi.Controllers
{
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

        // Chuỗi kết nối tới SQL Server (Dùng Windows Authentication / LocalDB mặc định)
        // Bạn có thể sửa đổi chuỗi kết nối này cho khớp với cấu hình SQL Server trên máy bạn
        private const string ConnectionString = "Server=localhost;Database=MockPaymentDb;User ID=sa;Password=123456;TrustServerCertificate=True;";

        static PaymentController()
        {
            InitDatabase();
        }

        private static void InitDatabase()
        {
            // Kết nối nháp đến master để tự động khởi tạo Database nếu chưa có
            string masterConnStr = "Server=localhost;Database=master;User ID=sa;Password=123456;TrustServerCertificate=True;";
            
            try
            {
                // 1. Tự động tạo cơ sở dữ liệu nếu chưa tồn tại
                using (var masterConn = new Microsoft.Data.SqlClient.SqlConnection(masterConnStr))
                {
                    masterConn.Open();
                    var checkDbCmd = masterConn.CreateCommand();
                    checkDbCmd.CommandText = "SELECT database_id FROM sys.databases WHERE name = 'MockPaymentDb';";
                    var dbId = checkDbCmd.ExecuteScalar();

                    if (dbId == null)
                    {
                        var createDbCmd = masterConn.CreateCommand();
                        createDbCmd.CommandText = "CREATE DATABASE MockPaymentDb;";
                        createDbCmd.ExecuteNonQuery();
                        Console.WriteLine("[SQL SERVER] Đã tự động khởi tạo Database MockPaymentDb thành công!");
                    }
                }

                // 2. Tạo bảng và nạp dữ liệu mẫu
                using (var connection = new Microsoft.Data.SqlClient.SqlConnection(ConnectionString))
                {
                    connection.Open();

                    // Tạo bảng Accounts nếu chưa tồn tại
                    var createTableCmd = connection.CreateCommand();
                    createTableCmd.CommandText = @"
                        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Accounts]') AND type in (N'U'))
                        BEGIN
                            CREATE TABLE [dbo].[Accounts] (
                                [Id] INT IDENTITY(1,1) PRIMARY KEY,
                                [AccountNumber] NVARCHAR(100),
                                [AccountName] NVARCHAR(250),
                                [BankName] NVARCHAR(250),
                                CONSTRAINT UC_Account UNIQUE (AccountNumber, BankName)
                            );
                        END;";
                    createTableCmd.ExecuteNonQuery();

                    // Kiểm tra xem đã có dữ liệu mẫu chưa
                    var checkCmd = connection.CreateCommand();
                    checkCmd.CommandText = "SELECT COUNT(*) FROM Accounts;";
                    int count = (int)checkCmd.ExecuteScalar();

                    if (count == 0)
                    {
                        // Nạp dữ liệu mẫu
                        var insertCmd = connection.CreateCommand();
                        insertCmd.CommandText = @"
                            INSERT INTO Accounts (AccountNumber, AccountName, BankName) VALUES
                            ('190354678120', 'NGUYEN VAN A', 'CB Bank - Ngan hang Con Bo'),
                            ('123456789', 'TRAN THI B', 'MEOMEUBank - Ngan hang Quoc Te Meo'),
                            ('987654321', 'PHAM VAN C', 'UUET Bank - Ngan hang Cong Nghe'),
                            ('111111111', 'LE THI D', 'VinaFake Bank - Chi nhanh Demo');";
                        insertCmd.ExecuteNonQuery();
                        Console.WriteLine("[SQL SERVER] Đã nạp thành công 4 tài khoản mẫu vào SQL Server!");
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[SQL SERVER ERROR] Lỗi cấu hình/kết nối SQL Server: {ex.Message}");
                Console.WriteLine("[GỢI Ý] Nếu SQL Server của bạn sử dụng tài khoản SA/mật khẩu, vui lòng cập nhật ConnectionString ở đầu file PaymentController.cs!");
            }
        }

        // 1. API Tạo đơn hàng và sinh link QR tự động theo IP máy
        [HttpPost("create-order")]
        public IActionResult CreateOrder([FromBody] OrderRequest request)
        {
            // 1. DÁN CÁI LINK BẠN VỪA COPY Ở BƯỚC 1 VÀO ĐÂY (Nhớ bỏ dấu / ở cuối link nếu có)
            string publicUrl = "http://172.20.10.4:5173";

            string orderId = "DH_" + DateTime.UtcNow.Ticks;

            // Đăng ký đơn hàng vào bộ nhớ tạm
            Orders[orderId] = new OrderStatus { OrderId = orderId, Amount = request.Amount, IsPaid = false };

            // 2. Đường link QR bây giờ sẽ chạy qua Internet công khai
            string qrLink = $"{publicUrl}/checkout?orderId={orderId}&amount={request.Amount}&info={Uri.EscapeDataString(request.OrderInfo)}";

            return Ok(new { orderId, qrLink });
        }

        // 2. API nhận phản hồi từ điện thoại quét mã gửi về
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

                // Ở đây bạn có thể log ra console hoặc cập nhật DB trạng thái Đã Thanh Toán
                Console.WriteLine($"[SUCCESS] Đơn hàng {request.OrderId} đã thanh toán thành công!");
                Console.WriteLine($"Ngân hàng: {request.BankName} | STK: {request.AccountNumber} | Chủ TK: {request.AccountName} | Số tiền: {request.Amount}");

                return Ok(new { success = true, message = "Backend đã nhận thông tin thanh toán thành công!" });
            }

            return NotFound(new { success = false, message = "Đơn hàng không tồn tại trên hệ thống!" });
        }

        // 3. API Kiểm tra trạng thái đơn hàng (để máy tính Polling và điện thoại kiểm tra trước khi thanh toán)
        [HttpGet("check-status/{orderId}")]
        public IActionResult CheckStatus(string orderId)
        {
            if (Orders.TryGetValue(orderId, out var order))
            {
                return Ok(new { exists = true, isPaid = order.IsPaid });
            }
            return Ok(new { exists = false, isPaid = false });
        }

        // 4. API Lấy tên chủ tài khoản dựa trên số tài khoản và ngân hàng thụ hưởng từ SQL Server
        [HttpGet("get-account-name")]
        public IActionResult GetAccountName([FromQuery] string accountNumber, [FromQuery] string bankName)
        {
            if (string.IsNullOrEmpty(accountNumber) || string.IsNullOrEmpty(bankName))
            {
                return BadRequest(new { success = false, message = "Số tài khoản và ngân hàng không được để trống!" });
            }

            try
            {
                using (var connection = new Microsoft.Data.SqlClient.SqlConnection(ConnectionString))
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