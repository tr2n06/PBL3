using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Pbl3.DataAccess.Models.Bookings
{
    [Table("RoundTickets")]
    public class RoundTickets
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int id { get; set; }

        [Required]
        [Column(TypeName = "varchar(16)")]
        public string codeTicket { get; set; }

        [Required]
        [Column(TypeName = "varchar(16)")]
        public string returnCodeTicket { get; set; }

        [ForeignKey("codeTicket")]
        public virtual Ticket ticket { get; set; }

        [ForeignKey("returnCodeTicket")]
        public virtual Ticket returnTicket { get; set; }
    }
}
