using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Pbl3.DataAccess.Models.Bookings;
using Pbl3.DataAccess.Models.Payment;

namespace Pbl3.DataAccess.Models.Others
{
    [Table ("Baggage")]
    public class Baggage
    {
        [Key]
        [Required]
        [Column(TypeName = "varchar(19)")]
        public string codeBaggage { get;set; }
        [Required]
        [Column(TypeName = "varchar(30)")]
        public string? codeTransaction { get; set; }
        [Required]
        [Column(TypeName = "varchar(16)")]
        public string codeTicket { get; set; }
        [Required]
        public int weight { get; set; }
        [Required]
        public string type { get;set; } //cabin, checked
        [Required]
        public string status { get; set;} //"confirmed" | "pending" | "completed";
        public virtual Transaction transaction { get; set; }
        public virtual Ticket ticket { get; set; }
    }
}
