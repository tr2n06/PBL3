using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Pbl3.DataAccess.Models.Bookings;
using Pbl3.DataAccess.Models.Payment;

namespace Pbl3.DataAccess.Models.Others
{
    [Table ("Baggage")]
    public class Baggage
    {
        [Required]
        [Column(TypeName = "varchar(30)")]
        public string codeTransaction { get; set; }
        [Required]
        [Column(TypeName = "varchar(6)")]
        public string codeTicket { get; set; }
        [Required]
        public int weight { get; set; }
        public virtual Transaction transaction { get; set; }
        public virtual Ticket ticket { get; set; }
    }
}
