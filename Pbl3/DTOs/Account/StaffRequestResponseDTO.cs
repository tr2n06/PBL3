public class StaffRequestResponseDTO
{
    public int? id { get;set; }
    public string requestId { get; set; }
    public string status { get; set; }
    public string createdAt { get; set; }

    public string? address { get; set; }
    public string? email { get; set; }
    public string? phone { get; set; }
    public string? oldAddress { get; set; }
    public string? oldEmail { get; set; }
    public string? oldPhone { get; set; }
} 