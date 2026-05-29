using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Pbl3.DataAccess.Models.Flights
{
    [Table ("TicketType")]
    public class TicketType
    {
        [Key]
        [Required]
        public int codeType { get; set; }
        [Required]
        [StringLength(100)]
        public string name { get; set; }
        [Required]
        public decimal priceBooked { get; set; }
        [Required]
        public Boolean canBeUpgrade { get; set; }
        [Required]
        public Boolean canBeCanceled { get; set; }
        [Required]
        public int weightBaggage { get; set; }
    }
}
