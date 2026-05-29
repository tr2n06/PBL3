using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Pbl3.DataAccess.Models.Users;
using Pbl3.DataAccess.Models.Flights;

namespace Pbl3.DataAccess.Models.Others
{
    [Table("Request")]
    public class Request
    {
        [Key]
        public string id { get; set; } = Guid.NewGuid().ToString();
        [Required]
        public string type { get; set; } //"cancellation" | "promotion" | "profile_edit"
        public int? requester_id { get; set; }
        [Required]
        public DateTime createAt { get; set; } = DateTime.Now;
        [Required]
        public string? description { get;set; }
        [Required]
        public string status { get; set; } = "pending"; // pending approved rejected
        public int? reviewer_id { get; set; }
        [Required]
        public DateTime reviewed_at {get; set; }
        public string? note { get; set; }
        


        // navigation
        public virtual User requester { get; set; }
        public virtual Admin reviewer { get;set; }
    }
}
