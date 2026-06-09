using System;
using System.Collections.Generic;

namespace Pbl3.DTOs.Bookings
{
    public class CompletePaymentRequestDTO
    {
        public string? bookingRef { get; set; }
        public string flightId { get; set; }
        public List<string> ticketClasses { get; set; } = new List<string>();
        public List<string> seatNumbers { get; set; } = new List<string>();
        public List<CompletePaymentPassengerDTO> passengers { get; set; } = new List<CompletePaymentPassengerDTO>();
        public CompletePaymentPassengerCountsDTO passengerCounts { get; set; }
        public List<decimal> basePrices { get; set; } = new List<decimal>();
        public List<string> seatTypes { get; set; } = new List<string>();
        public decimal seatSurchargeTotal { get; set; }
        public decimal totalPrice { get; set; }
        public List<int> extraBaggageKg { get; set; } = new List<int>();
        public int pointsUsed { get; set; }
        public int pointsEarned { get; set; }
        public string? returnFlightId { get; set; }
        public List<string>? returnSeatNumbers { get; set; } = new List<string>();
        public List<decimal>? returnBasePrices { get; set; } = new List<decimal>();
        public List<string>? returnSeatTypes { get; set; } = new List<string>();
        public List<string>? returnTicketClasses { get; set; } = new List<string>();
        public string paymentMethod { get; set; } // "card" | "qr" | "cash"
    }

    public class CompletePaymentPassengerDTO
    {
        public string passengerType { get; set; } // "adult" | "child" | "infant"
        public string title { get; set; }
        public string firstName { get; set; }
        public string? middleName { get; set; }
        public string lastName { get; set; }
        public string gender { get; set; } // "male" | "female" | "other"
        public string dateOfBirth { get; set; }
        public string cccd { get; set; }
        public string email { get; set; }
        public string phoneType { get; set; }
        public string countryCode { get; set; }
        public string phone { get; set; }
        public string? guardianPhone { get; set; }
    }

    public class CompletePaymentPassengerCountsDTO
    {
        public int adults { get; set; }
        public int children { get; set; }
        public int infants { get; set; }
    }
}
