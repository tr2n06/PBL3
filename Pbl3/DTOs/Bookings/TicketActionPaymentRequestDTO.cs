namespace Pbl3.DTOs.Bookings
{
    public class TicketActionPaymentRequestDTO
    {
        public string ActionType { get; set; } = "";
        public string TicketId { get; set; } = "";
        public string PaymentMethod { get; set; } = "";
        public decimal Amount { get; set; }

        public string? NewClass { get; set; }
        public string? SeatNumber { get; set; }
        public string? SeatType { get; set; }
        public decimal SeatFee { get; set; }

        public int? ExtraCheckedKg { get; set; }
    }

    public class TicketActionPaymentConfirmDTO
    {
        public string TransactionCode { get; set; } = "";
        public string PaymentMethod { get; set; } = "";
        public string? SourceBank { get; set; }
        public string? SourceAccount { get; set; }
        public string? AccountName { get; set; }
    }
}
