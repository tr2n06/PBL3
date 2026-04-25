using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Pbl3.DataAccess.Models.Payment
{
    [Table ("Transaction")] 
    public class Transaction 
    {
        [Key]
        [Required]
        [Column(TypeName = "varchar(30)")]
        public string codeTransaction { get; set; }
        [Required]
        [Column(TypeName = "varchar(100)")]
        public string sourceBank { get; set; }
        [Required]
        [Column(TypeName = "varchar(100)")]
        public string sourceAccount { get; set; }
        [Required]
        [Column(TypeName = "varchar(100)")]
        public string beneficiaryBank { get; set; }
        [Required]
        [Column(TypeName = "varchar(100)")]
        public string beneficiaryAccount { get; set; }
        [Required]
        public int transactionAmount { get; set; }
        [Required]
        public DateTime timeTransaction { get; set; }
    }
}