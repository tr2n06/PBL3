using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Pbl3.DataAccess.Models.Users;
using Pbl3.DataAccess.Models.Flights;
using Pbl3.DataAccess.Models.Others;

namespace Pbl3.DataAccess.Models.Promotions
{
    [Table("PromotionRequest")]
    public class PromotionRequest : Request
    {
        [Required]
        public int discount { get; set; }
        [Column(TypeName = "varchar(6)")]
        [Required]
        public string codeFlight {  get; set; }
        [Required]
        public DateOnly arriveDate { get; set; }
        [Required]
        public TimeOnly arriveTime { get; set; }
        [Required]
        public string reason { get;set; }

        // navigation
        public virtual Flight flight { get; set; }
    }
}