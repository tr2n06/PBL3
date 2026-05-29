using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Pbl3.DataAccess.Models.Bookings;

namespace Pbl3.DataAccess.Models.Flights
{
    [Table ("FlightSeat")]
    public class FlightSeat
    {
        [Required]
        [Column(TypeName = "varchar(3)")]
        public string codeSeat { get; set; }
        [Required]
        [Column(TypeName = "varchar(6)")]
        public string codeFlight { get; set; }
        [Required]
        public DateOnly arriveDate { get; set; }
        [Required]
        public TimeOnly arriveTime { get; set; }
        [Required]
        public Boolean isBooked { get; set; }
        public virtual Flight flight { get; set; }
        public virtual Ticket ticket { get; set; }
        public virtual Seat seat { get; set; }
        }
}
