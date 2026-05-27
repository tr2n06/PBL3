using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Pbl3.DataAccess.Models.Flights;
using Pbl3.DataAccess.Models.Others;

namespace Pbl3.DataAccess.Models.Users
{
    [Table ("Staff")]
    public class Staff : User
    {
        [Required]
        public DateOnly joinedDate { get; set; }
        
    }
}
