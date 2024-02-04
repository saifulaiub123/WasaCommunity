// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace WasaCommunity.Resources
{

    /// <summary>
    /// Represents a resource for an alert-message
    /// </summary>
    public class AlertMessageResource
    {

        /// <summary>
        /// The id of the alert-message
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Represents basic information about the author of the alert-message
        /// </summary>
        [Required]
        public MinimalUserResource Author { get; set; }

        /// <summary>
        /// The title of the alert-message
        /// </summary>
        [Required]
        [StringLength(60)]
        public string Title { get; set; }

        /// <summary>
        /// The body of the alert-message
        /// </summary>
        public string Body { get; set; }

        /// <summary>
        /// The date and time of when the alert-message was sent
        /// </summary>
        [Required]
        public DateTimeOffset SentAt { get; set; }

        /// <summary>
        /// The list of recipients
        /// </summary>
        public ICollection<AlertRecipientResource> Recipients { get; set; } = new List<AlertRecipientResource>();
    }
}