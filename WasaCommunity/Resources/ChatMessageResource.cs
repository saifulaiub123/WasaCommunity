// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

using System;
using System.ComponentModel.DataAnnotations;
using DAL.Models;

namespace WasaCommunity.Resources
{

    /// <summary>
    /// Represents a chat-message
    /// </summary>
    public class ChatMessageResource
    {
        /// <summary>
        /// The id of the chat-message
        /// </summary>
        [Required]
        public string Id { get; set; }

        /// <summary>
        /// The time and date of when the chat-message was sent
        /// </summary>
        [Required]
        public DateTimeOffset SentAt { get; set; }

        /// <summary>
        /// Indicates if the chat-message has been read
        /// </summary>
        [Required]
        public bool IsRead { get; set; }

        /// <summary>
        /// The text of the chat-message
        /// </summary>
        [Required]
        public string Text { get; set; }

        /// <summary>
        /// The author of the chat-message
        /// </summary>
        [Required]
        public MinimalUserResource Author { get; set;}

        /// <summary>
        /// The receiver of the chat-message
        /// </summary>
        [Required]
        public MinimalUserResource Receiver { get; set; }
        
        /// <summary>
        /// The chat-thread that the chat-message belongs to
        /// </summary>
        [Required]
        public ChatThreadResource Thread { get; set; }
    }
}