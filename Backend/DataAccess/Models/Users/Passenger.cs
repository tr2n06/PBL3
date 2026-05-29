using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Pbl3.DataAccess.Models.Users
{
    [Table ("Passenger")]
    public class Passenger : User
    {
        [Required]
        public int pointReward { get; set; }
    }
}
