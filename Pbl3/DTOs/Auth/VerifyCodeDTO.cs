namespace Pbl3.DTOs.Auth
{
    public class VerifyCodeDTO
    {
        public string email { get; set; }
        public string code  { get; set; } = "";
    }
}
