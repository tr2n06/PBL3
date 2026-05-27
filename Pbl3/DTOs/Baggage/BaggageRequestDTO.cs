namespace Pbl3.DTOs.Baggage
{
    public class BaggageRequestDTO
    {
        public string? codeBaggage { get; set; }
        public string? codeTransaction { get;set; }
        public string codeTicket { get; set; }
        public string? type { get;set; } //cabin, checked
        public string status { get; set;} //"confirmed" | "pending" | "completed";
        public int? weight { get; set; }
    }
}
