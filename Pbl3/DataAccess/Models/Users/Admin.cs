using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Pbl3.DataAccess.Models.Users
{
    [Table("Admin")]
    public class Admin : User
    {
        [Required]
        public DateOnly joinedDate { get; set; }
    }
}
