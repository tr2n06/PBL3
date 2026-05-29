namespace Pbl3.DTOs.Flight
{
    public class FlightDTO
    {
        //Tên đầy đủ
        public string id { get; set; }
        public string flightNumber { get; set; }
        public LocationDTO arrival { get; set; }
        public LocationDTO departure { get; set; }
        public string duration { get; set; }
        public PriceDTO price { get; set; }
        public SeatAvailableDTO seatsAvailable { get; set; } = new SeatAvailableDTO();
        public string status { get; set; } //scheduled, boarding, departed, arrived, cancelled
        public int discount { get; set; }
        public bool isPromotion { get; set; }
        public bool? hasBookings { get; set; }
        public int? bookingCount { get; set; }
    }

    public class LocationDTO
    {
        public string city { get; set; }
        public string airport { get; set; }
        public string code { get; set; }

        public string date { get; set; }
        public string time { get; set; }

    }

    public class PriceDTO
    {
        public decimal economy { get; set; }
        public decimal bussiness { get; set; }
        public decimal firstClass { get; set; }
    }

    public class SeatAvailableDTO
    {
        public int economy { get; set; } = 0;
        public int bussiness { get; set; } = 0;
        public int firstClass { get; set; } = 0;
    }
}



