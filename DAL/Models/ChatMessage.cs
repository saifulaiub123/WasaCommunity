using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using DAL.Models.Interfaces;

namespace DAL.Models
{
    public class ChatMessage
    {
        [Required]
        public string Id { get; set; }

        [Required]
        public DateTimeOffset SentAt { get; set; }

        [Required]
        public bool IsRead { get; set; }

        [Required]
        public string Text { get; set; }

        [Required]
        public User Author { get; set; }

        [Required]
        public string AuthorId { get; set; }

        [Required]
        public User Receiver { get; set; }

        [Required]
        public string ReceiverId { get; set; }

        [Required]
        public ChatThread ChatThread { get; set; }

        [Required]
        public int ChatThreadId { get; set; }



    }
}