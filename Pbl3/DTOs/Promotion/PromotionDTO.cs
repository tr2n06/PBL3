namespace Pbl3.DTOs.Promotion
{
    public class PromotionDTO
    {
        public string id { get; set; }
        public string flightId { get; set; }
        public string flightNumber { get; set; }
        public string airline { get; set; }

        public string route { get; set; }
        public string departureCode { get; set; }
        public string departureCity { get; set; }
        public string departureTime { get; set; }
        public string departureDate { get; set; }
        public string arrivalCode { get; set; }
        public string arrivalCity { get; set; }
        public string arrivalTime { get; set; }
        public string arrivalDate { get; set; }
        public string duration { get; set; }

        public int discount { get; set; }
        public decimal economyPrice { get; set; }

        public DateTime createAt { get; set; }
    }
}