using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Pbl3.DataAccess.Models.Flights
{
    [Table("DiscountFlight")]
    public class DiscountFlight
    {
        [Column(TypeName = "varchar(6)")]
        [Required]
        public string codeFlight { get; set; }
        [Required]
        public DateOnly departureDate { get; set; }
        [Required]
        public TimeOnly departureTime { get; set; }
        [Required]
        public int discountPercentage { get; set; }
        public virtual Flight flight { get; set; }
    }
}
