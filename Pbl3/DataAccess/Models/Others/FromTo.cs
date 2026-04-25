using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Pbl3.DataAccess.Models.Others
{
    [Table("FromTo")]
    public class FromTo {
        [Key]
        [Required]
        [Column(TypeName = "varchar(6)")]
        public string codeFlight { get; set; }
        [Required]
        [StringLength(10)]
        public string from { get; set; }
        [Required]
        [StringLength(10)]
        public string to { get; set; }
        public virtual City fromCity { get; set; }
        public virtual City toCity { get; set; }
    }
}