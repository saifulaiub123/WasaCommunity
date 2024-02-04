// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using FluentValidation;
using System.ComponentModel.DataAnnotations;

namespace WasaCommunity.Resources
{
    /// <summary>
    /// Represents the resource used for editing a user
    /// </summary>
    public class UserEditResource : UserResource
    {
        /// <summary>
        /// The current password of the user
        /// </summary>
        public string CurrentPassword { get; set; }

        /// <summary>
        /// The new password of the user
        /// </summary>
        [MinLength(6, ErrorMessage = "New Password must be at least 6 characters")]
        public string NewPassword { get; set; }

        /// <summary>
        /// Indicates if the user is currently locked out or not
        /// </summary>
        new private bool IsLockedOut { get; } //Hide base member
    }
}
