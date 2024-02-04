// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

using DAL.Models;
using FluentValidation;
using WasaCommunity.Helpers;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;


namespace WasaCommunity.Resources
{
    /// <summary>
    /// Represents a resource that only contains basic information about a user
    /// </summary>
    public class MinimalUserResource
    {
        /// <summary>
        /// The id of the user
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// The full name of the person
        /// </summary>
        public string FullName { get; set; }

        /// <summary>
        /// The email address to the person
        /// </summary>
        [Required(ErrorMessage = "Email is required"), StringLength(200, ErrorMessage = "Email must be at most 200 characters"), EmailAddress(ErrorMessage = "Invalid email address")]
        public string Email { get; set; }

        /// <summary>
        /// The job title pf the person
        /// </summary>
        public string JobTitle { get; set; }

        /// <summary>
        /// The image url pointing to the persons avatar which is used for representation
        /// </summary>
        public string ImageUrl { get; set; } = "default-avatar.png";
    }
}
