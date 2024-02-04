// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

using WasaCommunity.Helpers;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WasaCommunity.Resources
{
    /// <summary>
    /// Represents a role that is used to give users different access
    /// </summary>
    public class RoleResource
    {
        /// <summary>
        /// The Id of the role
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// The name of the role
        /// </summary>
        [Required(ErrorMessage = "Role name is required"), StringLength(200, MinimumLength = 2, ErrorMessage = "Role name must be between 2 and 200 characters")]
        public string Name { get; set; }

        /// <summary>
        /// The description of the role
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// The number of users currently possessing the role
        /// </summary>
        public int UsersCount { get; set; }

        /// <summary>
        /// The permissions of the role
        /// </summary>
        public PermissionResource[] Permissions { get; set; }
    }
}
