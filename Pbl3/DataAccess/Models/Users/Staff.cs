using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Pbl3.DataAccess.Models.Users
{
    [Table ("Staff")]
    public class Staff : User
    {
        [Required]
        public DateOnly joinedDate { get; set; }
    }
}
