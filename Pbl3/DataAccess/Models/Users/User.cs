using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Pbl3.DataAccess.Models.Bookings;

namespace Pbl3.DataAccess.Models.Users
{
    [Table ("User")]
    public class User
    {
        [Key]
        [Required]
        public int id { get; set; }
        [Required]
        [StringLength(100)]
        public string name { get; set; }
        [Required]
        public int gender { get; set; }
        public DateOnly dateOfBirth { get; set; }
        [StringLength(100)]
        public string address { get; set; }
        [Required]
        [Column(TypeName = "varchar(10)")]
        public string phoneNumber { get; set; }
        [Required]
        [Column(TypeName = "varchar(254)")]
        public string email { get; set; }
        [Required]
        [Column(TypeName = "varchar(10)")]
        public string pass { get; set; }
        public virtual List<Booking> bookings { get; set; } = new List<Booking> ();

    }
}
