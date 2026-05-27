using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Pbl3.DataAccess.Models.Others;

namespace Pbl3.DataAccess.Models.Users
{
    [Table("Admin")]
    public class Admin : User
    {
        [Required]
        public DateOnly joinedDate { get; set; }

        public virtual List<Request> solved { get;set; } = new List<Request>();
    }
}
