namespace Pbl3.DTOs.Auth
{
    public class ResetPasswordDTO
    {
        // Sau khi người dùng nhập email, hệ thống sẽ gửi một mã xác nhận đến email đó.
        // Người dùng sẽ nhập mã xác nhận
        // Hệ thống hiển thị tên tài khoản
        // Người dùng nhập mật khẩu mới
        public string email {  get; set; }
        public string password {  get; set; }
    }
}
