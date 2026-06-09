using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Pbl3.DTOs.Bookings
{
    public class TicketRequestDTO
    {
        public string codeTicket { get; set; }
        public string? codeBooking { get; set; }
        public string? codeFlight { get; set; }
        public DateOnly? departureDate { get; set; }
        public TimeOnly? departureTime { get; set; }
        public string? codeSeat { get; set; }
        public string? name { get; set; }
        public string? identityCard { get; set; }
        public string? email { get;set; }
        public Boolean? CanSelectSeat { get; set; }
        public string? state { get;set; }
        public decimal? price { get; set; }
        public string? gender { get; set; }
        public string? passengerType { get; set; }
        public DateOnly? dateOfBirth { get; set; }
    }
}
