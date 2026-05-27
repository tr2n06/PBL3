namespace Pbl3.DTOs.Requests
{
    public class TicketCancellationRequestDTO
    {
        public int? requester_id { get;set; }
        public string ticketId { get; set; }
        public string reason { get; set; }
    }
}