using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using DAL;
using DAL.Core.Interfaces;
using DAL.Models;
using IdentityServer4.AccessTokenValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WasaCommunity.Logging;
using WasaCommunity.Resources;

namespace WasaCommunity.Controllers
{
    /// <summary>
    /// The endpoint used for application roles
    /// </summary>
    [Authorize(AuthenticationSchemes = IdentityServerAuthenticationDefaults.AuthenticationScheme)]
    [Route("api/roles")]
    public class RolesController : Controller
    {
        private IAccountManager _accountManager;
        private IAuthorizationService _authorizationService;
        private IUnitOfWork _unitOfWork;

        private const string GetRoleByIdActionName = "GetRoleById";

        public RolesController(IAccountManager accountManager, IAuthorizationService authorizationService,
                                IUnitOfWork unitOfWork)
        {
            _accountManager = accountManager;
            _authorizationService = authorizationService;
            _unitOfWork = unitOfWork;
        }


        /// <summary>
        /// Gets the role with the specified id
        /// </summary>
        /// <param name="roleId">The id of the role</param>
        /// <returns>The role with the specified id</returns>
        [HttpGet("{roleId}", Name = GetRoleByIdActionName)]
        [Produces(typeof(RoleResource))]
        public async Task<IActionResult> GetRoleById(string roleId)
        {
            var appRole = await _accountManager.GetRoleByIdAsync(roleId);

            if (!(await _authorizationService.AuthorizeAsync(this.User, appRole?.Name ?? "", Authorization.Policies.ViewRoleByRoleNamePolicy)).Succeeded)
                return new ChallengeResult();

            if (appRole == null)
                return NotFound(roleId);

            return await GetRoleByName(appRole.Name);
        }



        /// <summary>
        /// Gets the role with the specified name
        /// </summary>
        /// <param name="name">The name of the role</param>
        /// <returns>The role with the specified name</returns>
        [HttpGet("name/{name}")]
        [Produces(typeof(RoleResource))]
        public async Task<IActionResult> GetRoleByName(string name)
        {
            if (!(await _authorizationService.AuthorizeAsync(this.User, name, Authorization.Policies.ViewRoleByRoleNamePolicy)).Succeeded)
                return new ChallengeResult();


            RoleResource roleResource = await GetRoleViewModelHelper(name);

            if (roleResource == null)
                return NotFound(name);

            return Ok(roleResource);
        }



        /// <summary>
        /// Gets all roles
        /// </summary>
        /// <returns>All the roles</returns>
        [HttpGet]
        [Produces(typeof(List<RoleResource>))]
        [Authorize(Authorization.Policies.ViewAllRolesPolicy)]
        public async Task<IActionResult> GetRoles()
        {
            return await GetRoles(-1, -1);
        }



        /// <summary>
        /// Gets a specific amount of roles for a specific amount of pages
        /// </summary>
        /// <param name="page">Defines which page of roles should be returned</param>
        /// <param name="pageSize">Defines how many roles should be returned</param>
        /// <returns>A list of roles for a specified page with a specified page size</returns>
        [HttpGet("{page:int}/{pageSize:int}")]
        [Produces(typeof(List<RoleResource>))]
        [Authorize(Authorization.Policies.ViewAllRolesPolicy)]
        public async Task<IActionResult> GetRoles(int page, int pageSize)
        {
            var roles = await _accountManager.GetRolesLoadRelatedAsync(page, pageSize);
            return Ok(Mapper.Map<List<RoleResource>>(roles));
        }



        /// <summary>
        /// Updates the role with the specified id
        /// </summary>
        /// <param name="roleId">The id of the role</param>
        /// <param name="role">The resource used for updating the role</param>
        [HttpPut("{roleId}")]
        [Authorize(Authorization.Policies.ManageAllRolesPolicy)]
        public async Task<IActionResult> UpdateRole(string roleId, [FromBody] RoleResource role)
        {
            if (ModelState.IsValid)
            {
                if (role == null)
                    return BadRequest($"{nameof(role)} cannot be null");

                if (!string.IsNullOrWhiteSpace(role.Id) && roleId != role.Id)
                    return BadRequest("Conflicting role id in parameter and model data");



                Role appRole = await _accountManager.GetRoleByIdAsync(roleId);

                if (appRole == null)
                    return NotFound(roleId);


                Mapper.Map<RoleResource, Role>(role, appRole);

                var result = await _accountManager.UpdateRoleAsync(appRole, role.Permissions?.Select(p => p.Value).ToArray());
                if (result.Item1)
                    return NoContent();

                AddErrors(result.Item2);

            }

            return BadRequest(ModelState);
        }




        /// <summary>
        /// Creates a new role
        /// </summary>
        /// <param name="role">The resource used for creating a new role</param>
        /// <returns>The created role</returns>
        [HttpPost]
        [Authorize(Authorization.Policies.ManageAllRolesPolicy)]
        public async Task<IActionResult> CreateRole([FromBody] RoleResource role)
        {
            if (ModelState.IsValid)
            {
                if (role == null)
                    return BadRequest($"{nameof(role)} cannot be null");


                Role appRole = Mapper.Map<Role>(role);

                var result = await _accountManager.CreateRoleAsync(appRole, role.Permissions?.Select(p => p.Value).ToArray());
                if (result.Item1)
                {
                    RoleResource roleResource = await GetRoleViewModelHelper(appRole.Name);
                    return CreatedAtAction(GetRoleByIdActionName, new { id = roleResource.Id }, roleResource);
                }

                AddErrors(result.Item2);
            }

            return BadRequest(ModelState);
        }



        /// <summary>
        /// Deletes the role with the specified id
        /// </summary>
        /// <param name="roleId">The id of the role</param>
        /// <returns>The deleted role</returns>
        [HttpDelete("{roleId}")]
        [Produces(typeof(RoleResource))]
        [Authorize(Authorization.Policies.ManageAllRolesPolicy)]
        public async Task<IActionResult> DeleteRole(string roleId)
        {
            if (!await _accountManager.TestCanDeleteRoleAsync(roleId))
                return BadRequest("Role cannot be deleted. Remove all users from this role and try again");


            RoleResource roleResource = null;
            Role appRole = await this._accountManager.GetRoleByIdAsync(roleId);

            if (appRole != null)
                roleResource = await GetRoleViewModelHelper(appRole.Name);


            if (roleResource == null)
                return NotFound(roleId);

            var result = await this._accountManager.DeleteRoleAsync(appRole);
            if (!result.Item1)
                throw new Exception("The following errors occurred whilst deleting role: " + string.Join(", ", result.Item2));


            return Ok(roleResource);
        }


        
        private async Task<RoleResource> GetRoleViewModelHelper(string roleName)
        {
            var role = await _accountManager.GetRoleLoadRelatedAsync(roleName);
            if (role != null)
                return Mapper.Map<RoleResource>(role);


            return null;
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