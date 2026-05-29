using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Pbl3.DataAccess.Models.Flights
{
    [Table("DiscountFlights")]
    public class DiscountFlight
    {
        [Column(TypeName = "varchar(6)")]
        [Required]
        public string codeFlight { get; set; }
        [Required]
        public DateOnly arriveDate { get; set; }
        [Required]
        public TimeOnly arriveTime { get; set; }
        [Required]
        public int discountPercentage { get; set; }
        public virtual Flight flight { get; set; }
    }
}
