// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using WasaCommunity.Resources;
using AutoMapper;
using DAL.Models;
using DAL.Core.Interfaces;
using WasaCommunity.Authorization;
using WasaCommunity.Helpers;
using Microsoft.AspNetCore.JsonPatch;
using DAL.Core;
using IdentityServer4.AccessTokenValidation;
using WasaCommunity.Helpers.Exchange;
using Microsoft.Exchange.WebServices.Data;
using Newtonsoft.Json;
using DAL;
using WasaCommunity.Logging;

namespace WasaCommunity.Controllers
{
    /// <summary>
    /// The endpoint used for actions regarding users and their resources
    /// </summary>
    [Authorize(AuthenticationSchemes = IdentityServerAuthenticationDefaults.AuthenticationScheme)]
    [Route("api/users")]
    public class UsersController : Controller
    {
        private readonly IAccountManager _accountManager;
        private readonly IAuthorizationService _authorizationService;
        private IUnitOfWork _unitOfWork;
        private const string GetUserByIdActionName = "GetUserById";

        public UsersController(IAccountManager accountManager, IAuthorizationService authorizationService,
                                IUnitOfWork unitOfWork)
        {
            _accountManager = accountManager;
            _authorizationService = authorizationService;
            _unitOfWork = unitOfWork;
        }

        /// <summary>
        /// Gets the current user
        /// </summary>
        /// <returns>The current user</returns>
        [HttpGet("me")]
        [Produces(typeof(UserResource))]
        public async Task<IActionResult> GetCurrentUser()
        {
            return await GetUserByUserName(this.User.Identity.Name);
        }

        /// <summary>
        /// Gets a user by id
        /// </summary>
        /// <param name="userId">The id of the user</param>
        /// <returns>The user with the specified id</returns>
        [HttpGet("{userId}", Name = GetUserByIdActionName)]
        [Produces(typeof(UserResource))]
        public async Task<IActionResult> GetUserById(string userId)
        {
            if (!(await _authorizationService.AuthorizeAsync(this.User, userId, AccountManagementOperations.ReadUser)).Succeeded)
                return new ChallengeResult();


            UserResource userResource = await GetUserViewModelHelper(userId);

            if (userResource != null)
                return Ok(userResource);
            else
                return NotFound(userId);
        }


        /// <summary>
        /// Gets a user by username
        /// </summary>
        /// <param name="userName">The username (typically email-address)</param>
        /// <returns>The user with the specified username</returns>
        [HttpGet("username/{userName}")]
        [Produces(typeof(UserResource))]
        public async Task<IActionResult> GetUserByUserName(string userName)
        {
            User appUser = await _accountManager.GetUserByUserNameAsync(userName);

            if (!(await _authorizationService.AuthorizeAsync(this.User, appUser?.Id ?? "", AccountManagementOperations.ReadUser)).Succeeded)
                return new ChallengeResult();

            if (appUser == null)
                return NotFound(userName);

            return await GetUserById(appUser.Id);
        }


        /// <summary>
        /// Gets all the users
        /// </summary>
        /// <returns>A list of users</returns>
        [HttpGet]
        [Produces(typeof(List<UserResource>))]
        public async Task<IActionResult> GetUsers()
        {
            return await GetUsers(-1, -1);
        }


        /// <summary>
        /// Gets a specific amount of users for a specific amount of pages
        /// </summary>
        /// <param name="page">Defines which page of users should be returned</param>
        /// <param name="pageSize">Defines how many users should be returned</param>
        /// <returns>A list of users for a specified page with a specified page size</returns>
        [HttpGet("{page:int}/{pageSize:int}")]
        [Produces(typeof(List<UserResource>))]
        [Authorize(Authorization.Policies.ViewAllUsersPolicy)]
        public async Task<IActionResult> GetUsers(int page, int pageSize)
        {
            var usersAndRoles = await _accountManager.GetUsersAndRolesAsync(page, pageSize);

            List<UserResource> usersResource = new List<UserResource>();

            foreach (var item in usersAndRoles)
            {
                var userResource = Mapper.Map<UserResource>(item.Item1);
                userResource.Roles = item.Item2;

                usersResource.Add(userResource);
            }

            foreach (var item in usersResource)
            {
                item.Appointments = Mapper.Map<List<CalendarAppointmentResource>>(_unitOfWork.Appointments
                                        .Find(a => a.User.Id == item.Id));
            }

            return Ok(usersResource);
        }


        /// <summary>
        /// Updates the current user
        /// </summary>
        /// <param name="user">UserEditResource</param>
        /// <returns>The updated user</returns>
        [HttpPut("me")]
        public async Task<IActionResult> UpdateCurrentUser([FromBody] UserEditResource user)
        {
            return await UpdateUser(Utilities.GetUserId(this.User), user);
        }


        /// <summary>
        /// Updates the user specified with the id
        /// </summary>
        /// <param name="userId">The id of the user</param>
        /// <param name="user">The resource used for updating the user</param>
        /// <returns>The updated user</returns>
        [HttpPut("{userId}")]
        public async Task<IActionResult> UpdateUser(string userId, [FromBody] UserEditResource user)
        {
            User appUser = await _accountManager.GetUserByIdAsync(userId);
            string[] currentRoles = appUser != null ? (await _accountManager.GetUserRolesAsync(appUser)).ToArray() : null;

            var manageUsersPolicy = _authorizationService.AuthorizeAsync(this.User, userId, AccountManagementOperations.UpdateUser);
            var assignRolePolicy = _authorizationService.AuthorizeAsync(this.User, Tuple.Create(user.Roles, currentRoles), Authorization.Policies.AssignAllowedRolesPolicy);


            if ((await System.Threading.Tasks.Task.WhenAll(manageUsersPolicy, assignRolePolicy)).Any(r => !r.Succeeded))
                return new ChallengeResult();


            if (ModelState.IsValid)
            {
                if (user == null)
                    return BadRequest($"{nameof(user)} cannot be null");

                if (!string.IsNullOrWhiteSpace(user.Id) && userId != user.Id)
                    return BadRequest("Conflicting user id in parameter and model data");

                if (appUser == null)
                    return NotFound(userId);


                if (Utilities.GetUserId(this.User) == userId && string.IsNullOrWhiteSpace(user.CurrentPassword))
                {
                    if (!string.IsNullOrWhiteSpace(user.NewPassword))
                        return BadRequest("Current password is required when changing your own password");

                    if (appUser.UserName != user.UserName)
                        return BadRequest("Current password is required when changing your own username");
                }


                bool isValid = true;

                if (Utilities.GetUserId(this.User) == userId && (appUser.UserName != user.UserName || !string.IsNullOrWhiteSpace(user.NewPassword)))
                {
                    if (!await _accountManager.CheckPasswordAsync(appUser, user.CurrentPassword))
                    {
                        isValid = false;
                        AddErrors(new string[] { "The username/password couple is invalid." });
                    }
                }

                if (isValid)
                {
                    Mapper.Map<UserResource, User>(user, appUser);

                    var result = await _accountManager.UpdateUserAsync(appUser, user.Roles);
                    if (result.Item1)
                    {
                        if (!string.IsNullOrWhiteSpace(user.NewPassword))
                        {
                            if (!string.IsNullOrWhiteSpace(user.CurrentPassword))
                                result = await _accountManager.UpdatePasswordAsync(appUser, user.CurrentPassword, user.NewPassword);
                            else
                                result = await _accountManager.ResetPasswordAsync(appUser, user.NewPassword);
                        }

                        if (result.Item1)
                            return NoContent();
                    }

                    AddErrors(result.Item2);
                }
            }

            return BadRequest(ModelState);
        }



        /// <summary>
        /// Partially updates the current user
        /// </summary>
        /// <param name="patch">JsonPatchDocument of UserPatchResource</param>
        /// <returns>The partially updated user</returns>
        [HttpPatch("me")]
        public async Task<IActionResult> UpdateCurrentUser([FromBody] JsonPatchDocument<UserPatchResource> patch)
        {
            return await UpdateUser(Utilities.GetUserId(this.User), patch);
        }


        /// <summary>
        /// Partially updates the user with the specified id
        /// </summary>
        /// <param name="userId">The id of the user</param>
        /// <param name="patch">JsonPatchDocument of UserPatchResource</param>
        /// <returns>The partially updated user</returns>
        [HttpPatch("{userId}")]
        public async Task<IActionResult> UpdateUser(string userId, [FromBody] JsonPatchDocument<UserPatchResource> patch)
        {
            if (!(await _authorizationService.AuthorizeAsync(this.User, userId, AccountManagementOperations.UpdateUser)).Succeeded)
                return new ChallengeResult();


            if (ModelState.IsValid)
            {
                if (patch == null)
                    return BadRequest($"{nameof(patch)} cannot be null");


                User appUser = await _accountManager.GetUserByIdAsync(userId);

                if (appUser == null)
                    return NotFound(userId);


                UserPatchResource userPatchResource = Mapper.Map<UserPatchResource>(appUser);
                patch.ApplyTo(userPatchResource, ModelState);


                if (ModelState.IsValid)
                {
                    Mapper.Map<UserPatchResource, User>(userPatchResource, appUser);

                    var result = await _accountManager.UpdateUserAsync(appUser);
                    if (result.Item1)
                        return NoContent();


                    AddErrors(result.Item2);
                }
            }

            return BadRequest(ModelState);
        }



        /// <summary>
        /// Registers a new user
        /// </summary>
        /// <param name="user">UserEditResource</param>
        /// <returns>The registered user</returns>
        [HttpPost]
        [Authorize(Authorization.Policies.ManageAllUsersPolicy)]
        public async Task<IActionResult> Register([FromBody] UserEditResource user)
        {
            if (!(await _authorizationService.AuthorizeAsync(this.User, Tuple.Create(user.Roles, new string[] { }), Authorization.Policies.AssignAllowedRolesPolicy)).Succeeded)
                return new ChallengeResult();


            if (ModelState.IsValid)
            {
                if (user == null)
                    return BadRequest($"{nameof(user)} cannot be null");


                User appUser = Mapper.Map<User>(user);

                var result = await _accountManager.CreateUserAsync(appUser, user.Roles, user.NewPassword);
                if (result.Item1)
                {
                    UserResource userResource = await GetUserViewModelHelper(appUser.Id);
                    return CreatedAtAction(GetUserByIdActionName, new { id = userResource.Id }, userResource);
                }

                AddErrors(result.Item2);
            }

            return BadRequest(ModelState);
        }


        /// <summary>
        /// Delete the user with the specified id
        /// </summary>
        /// <param name="userId">The id of the user</param>
        /// <returns>The deleted user</returns>
        [HttpDelete("{userId}")]
        [Produces(typeof(UserResource))]
        public async Task<IActionResult> DeleteUser(string userId)
        {
            if (!(await _authorizationService.AuthorizeAsync(this.User, userId, AccountManagementOperations.DeleteUser)).Succeeded)
                return new ChallengeResult();

            UserResource userResource = null;
            User appUser = await this._accountManager.GetUserByIdAsync(userId);

            if (appUser != null)
                userResource = await GetUserViewModelHelper(appUser.Id);


            if (userResource == null)
                return NotFound(userId);

            var result = await this._accountManager.DeleteUserAsync(appUser);
            if (!result.Item1)
                throw new Exception("The following errors occurred whilst deleting user: " + string.Join(", ", result.Item2));


            return Ok(userResource);
        }


        /// <summary>
        /// Unblocks the user with the specified id
        /// </summary>
        /// <param name="userId">The id of the user</param>
        /// <returns>The unblocked user</returns>
        [HttpPut("{userId}/unblock")]
        [Authorize(Authorization.Policies.ManageAllUsersPolicy)]
        public async Task<IActionResult> UnblockUser(string userId)
        {
            User appUser = await this._accountManager.GetUserByIdAsync(userId);

            if (appUser == null)
                return NotFound(userId);

            appUser.LockoutEnd = null;
            var result = await _accountManager.UpdateUserAsync(appUser);
            if (!result.Item1)
                throw new Exception("The following errors occurred whilst unblocking user: " + string.Join(", ", result.Item2));


            return NoContent();
        }



        /// <summary>
        /// Gets the preferences for the current user
        /// </summary>
        /// <returns>The user configuration</returns>
        [HttpGet("me/preferences")]
        [Produces(typeof(string))]
        public async Task<IActionResult> UserPreferences()
        {
            var userId = Utilities.GetUserId(this.User);
            User appUser = await this._accountManager.GetUserByIdAsync(userId);

            if (appUser != null)
                return Ok(appUser.Configuration);
            else
                return NotFound(userId);
        }


        /// <summary>
        /// Updates the preferences for the current user
        /// </summary>
        /// <param name="data">The preferences to be updated</param>
        [HttpPut("me/preferences")]
        public async Task<IActionResult> UserPreferences([FromBody] string data)
        {
            var userId = Utilities.GetUserId(this.User);
            User appUser = await this._accountManager.GetUserByIdAsync(userId);

            if (appUser == null)
                return NotFound(userId);

            appUser.Configuration = data;
            var result = await _accountManager.UpdateUserAsync(appUser);
            if (!result.Item1)
                throw new Exception("The following errors occurred whilst updating User Configurations: " + string.Join(", ", result.Item2));


            return NoContent();
        }

        private async Task<UserResource> GetUserViewModelHelper(string userId)
        {
            var userAndRoles = await _accountManager.GetUserAndRolesAsync(userId);
            if (userAndRoles == null)
                return null;

            var userResource = Mapper.Map<UserResource>(userAndRoles.Item1);
            userResource.Roles = userAndRoles.Item2;
            userResource.Appointments = Mapper.Map<List<CalendarAppointmentResource>>(_unitOfWork.Appointments.Find(a => a.User.Id == userResource.Id));

            return userResource;
        }

        private void AddErrors(IEnumerable<string> errors)
        {
            foreach (var error in errors)
            {
                ModelState.AddModelError(string.Empty, error);
            }
        }

    }
}
