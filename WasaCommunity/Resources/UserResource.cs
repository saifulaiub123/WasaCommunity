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
    /// Represents a person that works at Wasa Sweden AB
    /// </summary>
    public class UserResource
    {
        /// <summary>
        /// The id of the person
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// The username of the user (typically the email of an employee)
        /// </summary>
        [Required(ErrorMessage = "Username is required"), StringLength(200, MinimumLength = 2, ErrorMessage = "Username must be between 2 and 200 characters")]
        public string UserName { get; set; }

        /// <summary>
        /// The full name of the person
        /// </summary>
        public string FullName { get; set; }

        /// <summary>
        /// The email of the person
        /// </summary>
        [Required(ErrorMessage = "Email is required"), StringLength(200, ErrorMessage = "Email must be at most 200 characters"), EmailAddress(ErrorMessage = "Invalid email address")]
        public string Email { get; set; }

        /// <summary>
        /// The job title of the person
        /// </summary>
        public string JobTitle { get; set; }

        /// <summary>
        /// The phone number of the person
        /// </summary>
        public string PhoneNumber { get; set; }

        /// <summary>
        /// The configuration of the person
        /// </summary>
        public string Configuration { get; set; }

        /// <summary>
        /// Indicates if the person is enabled or not (if the person is currently working for Wasa Sweden AB, this is set to true)
        /// </summary>
        public bool IsEnabled { get; set; }

        /// <summary>
        /// Indicates if the person is locked out or not
        /// </summary>
        public bool IsLockedOut { get; set; }

        /// <summary>
        /// The roles of the person
        /// </summary>
        [MinimumCount(1, ErrorMessage = "Roles cannot be empty")]
        public string[] Roles { get; set; }

        /// <summary>
        /// The image url pointing to the persons avatar which is used for representation
        /// </summary>
        public string ImageUrl { get; set; } = "default-avatar.png";

        /// <summary>
        /// The appointment status of the person (Contains a number that defines if the person is 0: On Vacation, 1: In a preliminary meeting, 2: Busy in a meeting, 3: Out of office, 4: Working elsewhere, 5: Not in a meeting)
        /// </summary>
        public int AppointmentStatus { get; set; }

        /// <summary>
        /// The appointments of the person
        /// </summary>
        public IEnumerable<CalendarAppointmentResource> Appointments { get; set; }
    }




    ////Todo: ***Using DataAnnotations for validations until Swashbuckle supports FluentValidation***
    //public class UserViewModelValidator : AbstractValidator<UserViewModel>
    //{
    //    public UserViewModelValidator()
    //    {
    //        //Validation logic here
    //        RuleFor(user => user.UserName).NotEmpty().WithMessage("Username cannot be empty");
    //        RuleFor(user => user.Email).EmailAddress().NotEmpty();
    //        RuleFor(user => user.Password).NotEmpty().WithMessage("Password cannot be empty").Length(4, 20);
    //    }
    //}
}
