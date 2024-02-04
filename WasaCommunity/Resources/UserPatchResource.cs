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
    /// Represents the resource used for updating a user
    /// </summary>
    public class UserPatchResource
    {
        /// <summary>
        /// The full name of the person
        /// </summary>
        public string FullName { get; set; }

        /// <summary>
        /// The job title of the person
        /// </summary>
        public string JobTitle { get; set; }

        /// <summary>
        /// The phone number of the person
        /// </summary>
        public string PhoneNumber { get; set; }

        /// <summary>
        /// The configuration settings for the user
        /// </summary>
        public string Configuration { get; set; }
    }
}
