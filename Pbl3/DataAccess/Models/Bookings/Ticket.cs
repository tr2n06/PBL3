using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Pbl3.DataAccess.Models.Flights;
using Pbl3.DataAccess.Models.Others;

namespace Pbl3.DataAccess.Models.Bookings
{
    [Table("Ticket")]
    public class Ticket {
        [Key]
        [Required]
        [Column(TypeName = "varchar(16)")]
        public string codeTicket { get; set; }
        [Required]
        [Column(TypeName = "varchar(8)")]
        public string codeBooking { get; set; }
        [Required]
        [Column(TypeName = "varchar(6)")]
        public string codeFlight { get; set; }
        [Required]
        public DateOnly arriveDate { get; set; }
        [Required]
        public TimeOnly arriveTime { get; set; }
        [Required]
        [Column(TypeName = "varchar(3)")]
        public string? codeSeat { get; set; }
        [Required]
        [StringLength(100)]
        public string name { get; set; }
        [Required]
        [StringLength(10)]
        public string gender { get; set; }
        [Required]
        [Column(TypeName = "varchar(20)")]
        public string identityCard { get; set; }
        [Required]
        public decimal price { get; set; }
        [Required]
        public Boolean CanSelectSeat { get; set; }
        [Required]
        public string email { get; set; }
        [Required]
        public string passengerType { get; set; } // "adult" | "child" | "infant";
        [Required]
        public string status { get; set;} //"confirmed" | "pending" | "cancelled" | "completed";
        [Required]
        public DateOnly dateOfBirth { get;set; }
        public virtual Flight flight { get; set; }
        public virtual FlightSeat seat { get; set; }
        public virtual Booking booking { get; set; }
        public virtual List<Baggage> baggages { get; set; } = new List<Baggage> ();
        public virtual CancelRequest request {  get; set; }
    }
}