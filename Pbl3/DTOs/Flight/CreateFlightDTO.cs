namespace Pbl3.DTOs.Flight
{
    public class CreateFlightDTO
    {
        public string? flightNumber { get; set; }
        //tên viết tắt
        public string arrivalCode { get; set; }
        public string departureCode { get; set; }
        public string arrivalDate { get; set; }
        public string arrivalTime { get; set; }
        public string departureDate { get; set; }
        public string departureTime { get; set; }
        public int? price { get; set; } = 500000;
    }
}
 