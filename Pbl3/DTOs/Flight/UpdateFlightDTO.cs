namespace Pbl3.DTOs.Flight
{
    public class UpdateFlightDTO
    {
        public string? flightId { get; set; }

        public string? flightNumber { get; set; }
        public string? departureDate { get; set; }
        public string? departureTime { get; set; }
        public string? arrivalDate { get; set; }
        public string? arrivalTime { get; set; }
        public decimal? priceFlight { get; set; }
        public string? status { get;set; }
    }
}
