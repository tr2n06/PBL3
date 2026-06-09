using System;

namespace Pbl3.DTOs.Bookings
{
    public class PaymentConfirmSuccessRequestDTO
    {
        public string bookingRef { get; set; }
        public string paymentMethod { get; set; }
        public string? sourceBank { get; set; }
        public string? sourceAccount { get; set; }
        public string? accountName { get; set; }
        public decimal amount { get; set; }
    }
}
