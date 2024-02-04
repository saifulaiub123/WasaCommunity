using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DAL.Models
{
    public class ChatThread
    {
        [Required]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public ICollection<ChatMessage> ChatMessages { get; set; } = new List<ChatMessage>();

        [Required]
        public User Owner { get; set; }

        [Required]
        public string OwnerId { get; set; }

        [Required]
        public User Receiver { get; set; }

        [Required]
        public string ReceiverId { get; set; }
    }
}