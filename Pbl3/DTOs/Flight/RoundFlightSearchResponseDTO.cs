namespace Pbl3.DTOs.Flight
{
    public class RoundFlightSearchResponseDTO
    {
        public FlightSearchResponseDTO departure { get; set; }
        public FlightSearchResponseDTO arrival { get; set; }
    }
}
