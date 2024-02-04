using System.Collections.Generic;
using AutoMapper;
using DAL.Core;
using IdentityServer4.AccessTokenValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WasaCommunity.Logging;
using WasaCommunity.Resources;

namespace WasaCommunity.Controllers
{
    /// <summary>
    /// Endpoint used for retrieving application permissions
    /// </summary>
    [Authorize(AuthenticationSchemes = IdentityServerAuthenticationDefaults.AuthenticationScheme)]
    [Route("api/permissions")]
    public class PermissionsController : Controller
    {

        /// <summary>
        /// Gets all the application permissions
        /// </summary>
        /// <returns>A list of the permissions in the application</returns>
        [HttpGet]
        [Produces(typeof(List<PermissionResource>))]
        [Authorize(Authorization.Policies.ViewAllRolesPolicy)]
        public IActionResult GetAllPermissions()
        {
            return Ok(Mapper.Map<List<PermissionResource>>(ApplicationPermissions.AllPermissions));
        }
    }
}