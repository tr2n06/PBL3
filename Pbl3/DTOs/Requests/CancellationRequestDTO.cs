namespace Pbl3.DTOs.Requests
{
    public class CancellationRequestDTO
    {
        public int? requester_id { get; set; }
        public string promotionId { get; set; }
        public string reason { get; set; }
    }
}