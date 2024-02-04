// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

using System;
using DAL.Models;
using Newtonsoft.Json;

namespace WasaCommunity.Resources
{
    /// <summary>
    /// Represents a chat-message that is used to indicate which chat-message was last sent in a chat-conversation
    /// </summary>
    public class LastMessageResource
    {
        /// <summary>
        /// The id of the chat-message
        /// </summary>
        public string Id { get; set; }
        /// <summary>
        /// The date and time of when the chat-message was sent
        /// </summary>
        public DateTimeOffset SentAt { get; set; }

        /// <summary>
        /// Indicates if the chat-message has been read
        /// </summary>
        public bool IsRead { get; set; }

        /// <summary>
        /// The text of the chat-message
        /// </summary>
        public string Text { get; set; }
        
    }
}