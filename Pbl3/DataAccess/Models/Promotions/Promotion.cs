using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Pbl3.DataAccess.Models.Flights;

namespace Pbl3.DataAccess.Models.Promotions
{
    [Table("Promotion")]
    public class Promotion
    {
        [Key]
        public string id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public int discount { get; set; }

        [Required]
        public DateTime createAt { get; set; } = DateTime.Now;

        [Column(TypeName = "varchar(6)")]
        [Required]
        public string codeFlight {  get; set; }
        [Required]
        public DateOnly departureDate { get; set; }
        [Required]
        public TimeOnly departureTime { get; set; }

        // navigation
        public virtual Flight flight { get; set; }
        public virtual PromotionCancelRequest cancelRequest { get;set; }
    }
}