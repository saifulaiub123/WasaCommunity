using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace DAL.Models
{
    public class AlertMessage
    {
        [Required]
        public string Id { get; set; }

        [Required]
        public User Author { get; set; }
        
        [Required]
        public string AuthorId { get; set; }

        [Required]
        [StringLength(60)]
        public string Title { get; set; }
        public string Body { get; set; }

        [Required]
        public DateTimeOffset SentAt { get; set; }
        public ICollection<AlertRecipient> AlertRecipients { get; set; } = new List<AlertRecipient>();

    }
}