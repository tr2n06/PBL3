namespace Pbl3.DTOs.Requests
{
    public class RequestResponseDTO
    {
        public string id { get; set; }
        public string type { get; set; } //"cancellation" | "promotion" | "profile_edit";
        public int requesterId { get; set; }
        public string requesterName { get; set; }
        public string requesterEmail { get; set; }
        public string requesterRole { get; set; }
        public string description { get; set; }
        public object data { get; set; }
        public string status { get; set; } //"pending" | "approved" | "rejected"
        public string createdAt { get; set; }
        public string? reviewedAt { get; set; }
        public int? reviewedBy { get; set; }
        public string? notes { get; set; }

    }
    public interface Data
    {

    }
    public class promotionData : Data
    {
        public string flightId { get; set; }
        public string flightNumber { get; set; }
        public string route { get; set; }
        public int discount { get; set; }
    }

    public class profile_editData : Data
    {
        public int id { get; set; }
        public string? address { get; set; }
        public string? email { get; set; }
        public string? phone { get; set; }
        public string? oldAddress { get; set; }
        public string? oldEmail { get; set; }
        public string? oldPhone { get; set; }
    }

    public class cancelPromotionData : Data
    {
        public string promotionId { get; set; }
        public string? flightNumber { get; set; }
        public string? reason { get; set; }
        public string action { get; set; } = "cancel_promotion";
    }

    public class cancellationData : Data
    {
        public string ticketCode { get; set; }
        public string reason { get; set; }
    }
}
