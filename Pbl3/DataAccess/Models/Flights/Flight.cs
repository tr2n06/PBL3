using Pbl3.DataAccess.Models.Others;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Pbl3.DataAccess.Models.Bookings;
using Pbl3.DataAccess.Models.Promotions;

namespace Pbl3.DataAccess.Models.Flights
{
    [Table ("Flight")]
    public class Flight
    {
        [Column(TypeName = "varchar(6)")]
        [Required]
        public string codeFlight {  get; set; }
        [Required]
        public DateOnly arriveDate { get; set; }
        [Required]
        public TimeOnly arriveTime { get; set; }
        [Required]
        public DateOnly landingDate { get; set; }
        [Required]
        public TimeOnly landingTime { get; set; }
        [Required]
        public decimal price { get; set; }
        [Required] 
        public string status { get; set; } //scheduled, boarding, departed, arrived, cancelled
        public virtual FromTo fromTo { get; set; }
        public virtual List<FlightSeat> flightSeats { get; set; } = new List<FlightSeat> ();
        public virtual List<Ticket> tickets { get; set; } = new List<Ticket> ();
        public virtual List<FlightRequest> requests { get; set; } = new List<FlightRequest> ();
        public virtual DiscountFlight discountFlight { get; set; }
        public virtual Promotion promotion { get; set; }
    }
}
