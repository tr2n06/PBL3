using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Pbl3.DataAccess.Models.Flights;
using Pbl3.DataAccess.Models.Others;

namespace Pbl3.DataAccess.Models.Users
{
    [Table ("StaffRequest")]
    public class StaffRequest : Request
    {
        [StringLength(100)]
        public string? address { get; set; }
        [Required]
        [Column(TypeName = "varchar(10)")]
        public string? phoneNumber { get; set; }
        [Required]
        [Column(TypeName = "varchar(254)")]
        public string? email { get; set; }
    }
}
