namespace Pbl3.DTOs.Auth
{
    public class LoginRequestDTO
    {
        public string email { get; set; }
        public string password { get; set; }
        public string? role { get; set; }
    }
}
