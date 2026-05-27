namespace Pbl3.DTOs.Requests
{
    public class PromotionRequestResponseDTO
    {
        public string id { get;set; }
        public string flightId { get;set; }
        public string flightNumber { get;set; }
        public string route { get;set; }
        public int discount { get;set; }
        public string reason { get;set; }
        public string status { get;set; }
        public string createdAt { get;set; }
    }
}