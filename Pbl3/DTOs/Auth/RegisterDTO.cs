namespace Pbl3.DTOs.Auth
{
    public class RegisterDTO
    {
        public string name {  get; set; }
        public string? gender { get; set; }
        public DateOnly? dateOfBirth { get; set; }
        public string? address { get; set; }
        public string phoneNumber { get; set; }
        public string email { get; set; }
        public string password { get; set; }
    }
}
