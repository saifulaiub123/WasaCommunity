﻿// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

using DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Core.Interfaces
{
    public interface IAccountManager
    {

        Task<bool> CheckPasswordAsync(User user, string password);
        Task<Tuple<bool, string[]>> CreateRoleAsync(Role role, IEnumerable<string> claims);
        Task<Tuple<bool, string[]>> CreateUserAsync(User user, IEnumerable<string> roles, string password);
        Task<Tuple<bool, string[]>> DeleteRoleAsync(Role role);
        Task<Tuple<bool, string[]>> DeleteRoleAsync(string roleName);
        Task<Tuple<bool, string[]>> DeleteUserAsync(User user);
        Task<Tuple<bool, string[]>> DeleteUserAsync(string userId);
        Task<Role> GetRoleByIdAsync(string roleId);
        Task<Role> GetRoleByNameAsync(string roleName);
        Task<Role> GetRoleLoadRelatedAsync(string roleName);
        Task<List<Role>> GetRolesLoadRelatedAsync(int page, int pageSize);
        Task<Tuple<User, string[]>> GetUserAndRolesAsync(string userId);
        Task<User> GetUserByEmailAsync(string email);
        Task<User> GetUserByIdAsync(string userId);
        Task<User> GetUserByUserNameAsync(string userName);
        Task<IList<string>> GetUserRolesAsync(User user);
        Task<List<Tuple<User, string[]>>> GetUsersAndRolesAsync(int page, int pageSize);
        Task<Tuple<bool, string[]>> ResetPasswordAsync(User user, string newPassword);
        Task<bool> TestCanDeleteRoleAsync(string roleId);
        Task<Tuple<bool, string[]>> UpdatePasswordAsync(User user, string currentPassword, string newPassword);
        Task<Tuple<bool, string[]>> UpdateRoleAsync(Role role, IEnumerable<string> claims);
        Task<Tuple<bool, string[]>> UpdateUserAsync(User user);
        Task<Tuple<bool, string[]>> UpdateUserAsync(User user, IEnumerable<string> roles);
    }
}
