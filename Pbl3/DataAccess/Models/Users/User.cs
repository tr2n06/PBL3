using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http.HttpResults;
using Pbl3.DataAccess.Models.Bookings;
using Pbl3.DataAccess.Models.Others;

namespace Pbl3.DataAccess.Models.Users
{
    [Table ("User")]
    public class User
    {
        [Key]
        [Required]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int id { get; set; }
        [Required]
        [StringLength(100)]
        public string name { get; set; }
        [Required]
        public int? gender { get; set; }
        public DateOnly? dateOfBirth { get; set; }
        [StringLength(100)]
        public string? address { get; set; }
        [Required]
        [Column(TypeName = "varchar(10)")]
        public string phoneNumber { get; set; }
        [Required]
        [Column(TypeName = "varchar(254)")]
        public string email { get; set; }

        [Required]
        [Column(TypeName = "varchar(10)")]
        public string status { get; set; } //"active" | "blocked" | "pending"
        [Required]
        [Column(TypeName = "varchar(100)")]
        public string pass { get; set; }
        [Required]
        public DateTime createdAt { get;set; }
        public virtual List<Booking> bookings { get; set; } = new List<Booking> ();
        public virtual List<CancelRequest> cancelRequests { get; set; } = new List<CancelRequest> ();
        public virtual List<Request> requests { get;set; } = new List<Request>();

    }
}
