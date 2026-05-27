namespace Pbl3.DTOs.Requests
{
    public class TicketCancellationRequestResponseDTO
    {
        public string id { get; set; }
        public string ticketId { get; set; }
        public string reason { get; set; }
        public string status { get;set; }
        public string createdAt { get;set; }
    }
}