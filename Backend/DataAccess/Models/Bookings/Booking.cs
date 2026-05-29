using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Globalization;
using Pbl3.DataAccess.Models.Payment;
using Pbl3.DataAccess.Models.Users;

namespace Pbl3.DataAccess.Models.Bookings
{
    [Table ("Booking")]
    public class Booking
    {
        [Key]
        [Required]
        [Column(TypeName = "varchar(8)")]
        public string codeBooking { get; set; }
        public int? idUser { get; set; }
        [Required]
        [Column(TypeName = "varchar(30)")]
        public string? codeTransaction { get; set; }
        [Required]
        public decimal bookedPrice { get; set; }
        [Required]
        public DateTime bookedTime { get; set; }
        public virtual List<Ticket> tickets { get; set; } = new List<Ticket>();
        public virtual Transaction transaction { get; set; }
        public virtual User user { get; set; }

    }
}
