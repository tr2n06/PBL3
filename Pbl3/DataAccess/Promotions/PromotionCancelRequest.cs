using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Pbl3.DataAccess.Models.Users;
using Pbl3.DataAccess.Models.Flights;
using Pbl3.DataAccess.Models.Others;

namespace Pbl3.DataAccess.Models.Promotions
{
    [Table("PromotionCancelRequest")]
    public class PromotionCancelRequest : Request
    {
        [Required]
        public string promotion_id { get;set; }
        [Required]
        public string reason { get;set; }

        // navigation
        public virtual Promotion promotion { get; set; }
    }
}