namespace Pbl3.DTOs.Requests
{
    public class CancellationPromotionRequestResponseDTO
    {
        public string id { get;set; }
        public string promotionId { get;set; }
        public string flightNumber { get;set; }
        public string route { get;set; }
        public string reason { get;set; }
        public string status { get;set; }
        public string createdAt { get;set; }
    }
}