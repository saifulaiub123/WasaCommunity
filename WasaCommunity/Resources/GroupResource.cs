// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using DAL.Models;

namespace WasaCommunity.Resources
{
    /// <summary>
    /// Represents a resource of a group
    /// </summary>
    public class GroupResource
    {

        /// <summary>
        /// The id of the group
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// The name of the group
        /// </summary>

        [Required(ErrorMessage = "Group name is required"), StringLength(50, MinimumLength = 2, ErrorMessage = "Group name must be between 2 and 50 characters")]
        public string Name { get; set; }

        /// <summary>
        /// The members of the group
        /// </summary>
        public IEnumerable<UserResource> Members { get; set; }

        /// <summary>
        /// The amount of users currently belonging to the group
        /// </summary>
        public int UsersCount { get; set; }
    }
}