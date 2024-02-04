// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WasaCommunity.Authorization
{
    public class Policies
    {
        ///<summary>Policy to allow viewing all user records.</summary>
        public const string ViewAllUsersPolicy = "View All Users";

        ///<summary>Policy to allow adding, removing and updating all user records.</summary>
        public const string ManageAllUsersPolicy = "Manage All Users";

        /// <summary>Policy to allow viewing details of all roles.</summary>
        public const string ViewAllRolesPolicy = "View All Roles";

        /// <summary>Policy to allow viewing details of all or specific roles (Requires roleName as parameter).</summary>
        public const string ViewRoleByRoleNamePolicy = "View Role by RoleName";

        /// <summary>Policy to allow adding, removing and updating all roles.</summary>
        public const string ManageAllRolesPolicy = "Manage All Roles";

        /// <summary>Policy to allow assigning roles the user has access to (Requires new and current roles as parameter).</summary>
        public const string AssignAllowedRolesPolicy = "Assign Allowed Roles";

        ///<summary>Policy to allow viewing details of all groups.</summary>
        public const string ViewAllGroupsPolicy = "View All Groups";

        /// <summary>Policy to allow adding, removing and updating all groups.</summary>
        public const string ManageAllGroupsPolicy = "Manage All Groups";

        ///<summary>Policy to allow viewing detailed information about the application.</summary>
        public const string ViewApplicationInsightsPolicy = "View Application Insights";
    }



    /// <summary>
    /// Operation Policy to allow adding, viewing, updating and deleting general or specific user records.
    /// </summary>
    public static class AccountManagementOperations
    {
        public const string CreateOperationName = "Create";
        public const string ReadOperationName = "Read";
        public const string UpdateOperationName = "Update";
        public const string DeleteOperationName = "Delete";

        public static UserAccountAuthorizationRequirement CreateUser = new UserAccountAuthorizationRequirement(CreateOperationName);
        public static UserAccountAuthorizationRequirement ReadUser = new UserAccountAuthorizationRequirement(ReadOperationName);
        public static UserAccountAuthorizationRequirement UpdateUser = new UserAccountAuthorizationRequirement(UpdateOperationName);
        public static UserAccountAuthorizationRequirement DeleteUser = new UserAccountAuthorizationRequirement(DeleteOperationName);

        public static GroupAuthorizationRequirement CreateGroup = new GroupAuthorizationRequirement(CreateOperationName);
        public static GroupAuthorizationRequirement ReadGroup = new GroupAuthorizationRequirement(ReadOperationName);
        public static GroupAuthorizationRequirement UpdateGroup = new GroupAuthorizationRequirement(UpdateOperationName);
        public static GroupAuthorizationRequirement DeleteGroup = new GroupAuthorizationRequirement(DeleteOperationName);

        public static ApplicationInsightsAuthorizationRequirement ReadApplicationInsights = new ApplicationInsightsAuthorizationRequirement(ReadOperationName);
    }
}
