namespace Pbl3.DTOs.Flight
{
    public class FlightSearchRequestDTO
    {
        public string from { get; set; }        
        public string to { get; set; }
        public string departDate { get; set; }
        public string? returnDate { get; set; }
        public string tripType { get; set; } //oneway, roundtrip
        public int passengers { get; set; }
        public int adults { get; set; }
        public int children { get; set; }
        public int infants { get; set; }
    }
} 