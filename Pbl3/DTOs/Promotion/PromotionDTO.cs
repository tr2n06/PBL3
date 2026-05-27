namespace Pbl3.DTOs.Promotion
{
    public class PromotionDTO
    {
        public string id { get; set; }
        public string flightId { get; set; }
        public string flightNumber { get; set; }
        public string airline { get; set; }

        public string route { get; set; }

        public int discount { get; set; }
        public decimal economyPrice { get; set; }

        public DateTime createAt { get; set; }
    }
}