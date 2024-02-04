// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

using System;
using System.Linq;

namespace WasaCommunity.Resources
{
    /// <summary>
    /// Represents the resource used for application permissions
    /// </summary>
    public class PermissionResource
    {
        /// <summary>
        /// The name of the permission
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// The value of the permission
        /// </summary>
        public string Value { get; set; }

        /// <summary>
        /// The name of the group that the permission belongs to
        /// </summary>
        public string GroupName { get; set; }

        /// <summary>
        /// The description of the permission
        /// </summary>
        public string Description { get; set; }
    }
}
