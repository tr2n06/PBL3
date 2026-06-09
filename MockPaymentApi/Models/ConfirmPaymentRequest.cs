namespace MockPaymentApi.Models
{
    public class ConfirmPaymentRequest
    {
        public string OrderId { get; set; }
        public string BankName { get; set; }
        public string AccountNumber { get; set; }
        public string AccountName { get; set; }
        public long Amount { get; set; }
    }
}