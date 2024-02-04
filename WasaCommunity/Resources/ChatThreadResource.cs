// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace WasaCommunity.Resources
{
    /// <summary>
    /// Represents a chat-thread (a chat-conversation betwen two users)
    /// </summary>
    public class ChatThreadResource
    {
        /// <summary>
        /// The id of the chat-thread
        /// </summary>
        [Required]
        public string Id { get; set; }

        /// <summary>
        /// The last message sent in the chat-thread
        /// </summary>
        public LastMessageResource LastMessage { get; set; }

        /// <summary>
        /// The name of the chat-thread (the full name of the person who started the chat-conversation)
        /// </summary>
        [Required]
        public string Name { get; set; }

        /// <summary>
        /// The image url pointing to the avatar of the person who started the chat-thread
        /// </summary>
        [Required]
        public string AvatarSrc { get; set; }
        

    }
}