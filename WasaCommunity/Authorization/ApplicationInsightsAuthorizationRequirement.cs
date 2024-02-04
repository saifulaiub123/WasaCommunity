// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

using DAL.Core;
using Microsoft.AspNetCore.Authorization;
using System.Collections.Generic;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using WasaCommunity.Helpers;

namespace WasaCommunity.Authorization
{
    public class ApplicationInsightsAuthorizationRequirement : IAuthorizationRequirement
    {
        public ApplicationInsightsAuthorizationRequirement(string operationName)
        {
            this.OperationName = operationName;
        }


        public string OperationName { get; private set; }
    }



    public class ViewApplicationInsightsAuthorizationHandler : AuthorizationHandler<ApplicationInsightsAuthorizationRequirement>
    {
        protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, ApplicationInsightsAuthorizationRequirement requirement)
        {
            if (context.User == null)
                return Task.CompletedTask;

            if (context.User.HasClaim(ClaimConstants.Permission, ApplicationPermissions.ViewApplicationInsights))
                context.Succeed(requirement);

            return Task.CompletedTask;
        }
    }

}
