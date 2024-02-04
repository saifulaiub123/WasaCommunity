using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DAL.Models
{
    public class AlertRecipient
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public string Id { get; set; }

        [Required]
        public AlertMessage Alert { get; set; }

        [Required]
        public string AlertId { get; set; }

        [Required]
        public User Recipient { get; set; }

        [Required]
        public string RecipientId { get; set; }

        [Required]
        public bool IsRead { get; set; }

        [Required]
        public bool IsDeleted { get; set; }
    }
}