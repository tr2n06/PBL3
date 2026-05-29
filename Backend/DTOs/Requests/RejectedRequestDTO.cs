namespace Pbl3.DTOs.Requests
{
    public class RejectedRequestDTO
    {
        public int? admin_id { get;set; }
        public string requestId { get; set; }
        public string reason { get; set; }
    }
}