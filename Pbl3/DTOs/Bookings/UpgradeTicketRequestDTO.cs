namespace Pbl3.DTOs.Bookings
{
    public class UpgradeTicketRequestDTO
    {
        public string TicketId { get; set; }
        public string NewClass { get; set; }
        public string? SeatNumber { get; set; }
        public string? SeatType { get; set; }
        public decimal SeatFee { get; set; }
        public decimal UpgradeFee { get; set; }
        public string PaymentMethod { get; set; }
    }
}
