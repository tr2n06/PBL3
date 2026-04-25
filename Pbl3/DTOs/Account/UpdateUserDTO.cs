namespace Pbl3.DTOs.Account
{
    public class UpdateUserDTO
    {
        public int id { get; set; }
        public string? gender { get; set; }
        public DateOnly? dateOfBirth { get; set; }
        public string? address { get; set; }
        public string? phoneNumber { get; set; }
        public string? email { get; set; }
        public int? pointReward { get; set; }
        public string password { get; set; }
    }
}
