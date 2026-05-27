using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Pbl3.DataAccess.Models.Bookings;
using Pbl3.DataAccess.Models.Users;
using Pbl3.DataAccess.Models.Others;

namespace Pbl3.DataAccess.Models.Bookings
{
    [Table("CancelRequest")]
    public class CancelRequest : Request
    {
        [Required]
        [Column(TypeName = "varchar(16)")]
        public string codeTicket { get; set; }
        [Required]
        public string reason { get; set; }

        public virtual Ticket ticket { get; set; }
    }
}
