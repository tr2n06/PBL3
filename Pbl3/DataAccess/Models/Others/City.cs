using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Pbl3.DataAccess.Models.Others
{
    [Table("City")]
    public class City
    {
        [Key]
        [Required]
        [Column(TypeName = "varchar(10)")]
        public string abbreviatedName { get; set; }
        [Required]
        [StringLength(100)]
        public string fullName { get; set; }
        [Required]
        [StringLength(100)]
        public string airplane { get; set; }
    }
}