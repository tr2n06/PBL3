namespace Pbl3.DTOs.Account
{
    public class StaffResponseDTO
    {
        public int id { get; set; }
        public string? name { get; set; }
        public string? email { get; set; }
        public string? phone { get; set; }
        public string? gender { get; set; }
        public string? address { get; set; }
        public string? nationalId { get; set; }
        public string? dateOfBirth { get; set; }
        public string status { get; set; }
        public string role { get; set; } = "Staff";
    }
}
