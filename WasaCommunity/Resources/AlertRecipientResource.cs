// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

using System.ComponentModel.DataAnnotations;

namespace WasaCommunity.Resources
{
    /// <summary>
    /// Represents the recipient of an alert-message
    /// </summary>
    public class AlertRecipientResource
    {
        /// <summary>
        /// The id of the alert-message
        /// </summary>
        [Required]
        public string AlertId { get; set; }

        /// <summary>
        /// The id of the recipient user 
        /// </summary>
        [Required]
        public string RecipientId { get; set; }

        /// <summary>
        /// Indicates if the alert-message has been read
        /// </summary>
        [Required]
        public bool IsRead { get; set; }

        /// <summary>
        /// Indicates if the alert-message has been deleted
        /// </summary>
        [Required]
        public bool IsDeleted { get; set; }
    }
}