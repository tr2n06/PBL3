using System.ComponentModel.DataAnnotations;
using Pbl3.DTOs.Baggage;
using Pbl3.DTOs.Flight;

namespace Pbl3.DTOs.Bookings
{
    public class TicketResponseDTO
    {
        public string id { get; set; }
        public string bookingRef { get; set; }
        public string passengerName { get; set; }
        public string seatNumber { get; set; }
        public string ticketClass { get; set; }
        public decimal price { get; set; }
        public string status { get; set; }
        public string flightId { get; set; }

        public BaggageDTO baggage { get; set; }

        public FlightInformation flight { get; set; }


    }

    public class FlightInformation
    {
        public string flightNumber { get; set; }
        public string airline { get; set; }
        public LocationDTO arrival { get; set; }
        public LocationDTO departure { get; set; }
        public string duration { get; set; }
    }
}
