using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Pbl3.DataAccess.Models.Bookings;

namespace Pbl3.DataAccess.Models.Flights
{
    [Table ("Seat")]
    public class Seat
    {
        [Required]
        [Column(TypeName = "varchar(3)")]
        public string codeSeat { get; set; }
        public int? codeType { get; set; }
        public virtual TicketType type { get; set; }
        }
}
