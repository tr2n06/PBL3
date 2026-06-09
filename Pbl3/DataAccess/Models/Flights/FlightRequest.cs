using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Pbl3.DataAccess.Models.Users;
using Pbl3.DataAccess.Models.Others;
namespace Pbl3.DataAccess.Models.Flights
{

    [Table("FlightRequest")]
    public class FlightRequest : Request
    {
        [Column(TypeName = "varchar(6)")]
        [Required]
        public string codeFlight { get; set; }
        [Required]
        public DateOnly departureDate { get; set; }
        [Required]
        public TimeOnly departureTime { get; set; }
        [Required]
        public int discount { get; set; }
        //
        public virtual Flight flight { get; set; }
    }
}