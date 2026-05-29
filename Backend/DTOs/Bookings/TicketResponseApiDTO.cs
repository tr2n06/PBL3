namespace Pbl3.DTOs.Bookings
{
    public class TicketDTO
    {
        public string id { get; set; }
        public string bookingRef { get; set; }
        public string bookedAt { get; set; }
        public decimal totalPrice { get; set; }
        public string status { get; set; }

        public string passengerName { get; set; }
        public string? passengerEmail { get; set; }
        public string? seatNumber { get; set; }

        public string ticketClass { get; set; }

        public BaggageApiDTO baggage { get; set; }

        public FlightApiDTO flight { get; set; }
    }
    public class BaggageApiDTO
    {
        public int cabin { get; set; }
        public int checkedBaggage { get; set; }
    }
    public class FlightApiDTO
    {
        public string id { get; set; }
        public string flightNumber { get; set; }
        public string airline { get; set; }
        public string duration { get; set; }

        public string departureCode { get; set; }
        public string departureCity { get; set; }
        public string? departureAirport { get; set; } 
        public string departureTime { get; set; }
        public string departureDate { get; set; } 

        public string arrivalCode { get; set; }
        public string arrivalCity { get; set; }
        public string? arrivalAirport { get; set; }
        public string arrivalTime { get; set; }
        public string arrivalDate { get; set; }
    }
}