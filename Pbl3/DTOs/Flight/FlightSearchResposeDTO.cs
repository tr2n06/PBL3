namespace Pbl3.DTOs.Flight
{
    public class FlightSearchResponseDTO
    {
        //Tên đầy đủ
        public string id { get; set; }
        public string flightNumber { get; set; }
        public string airline { get; set; } = "Skylines";
        public string duration { get; set; }

        public string arrivalCode { get; set; }
        public string arrivalCity { get; set; }
        public string arrivalAirport { get; set; }
        public string arrivalTime { get; set; }
        public string arrivalDate { get; set; }

        public string departureCode { get; set; }
        public string departureCity { get; set; }
        public string departureAirport { get; set; }
        public string departureTime { get; set; }
        public string departureDate { get; set; }

        public decimal economyPrice { get; set; }
        public decimal businessPrice { get; set; }
        public decimal firstClassPrice { get; set; }

        public int economySeats { get; set; }
        public int businessSeats { get; set; }
        public int firstClassSeats { get; set; }

        public string status { get; set; } //scheduled, boarding, departed, arrived, cancelled
        public int discount { get; set; }
        public bool isPromotion { get; set; }
    }
}
