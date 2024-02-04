using System;
using System.Collections.Generic;
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
    /// The endpoint used for groups
    /// </summary>
    [Authorize(AuthenticationSchemes = IdentityServerAuthenticationDefaults.AuthenticationScheme)]
    [Route("api/groups")]
    public class GroupsController : Controller
    {
        private IUnitOfWork _unitOfWork;
        private IAccountManager _accountManager;

        public GroupsController(IUnitOfWork unitOfWork, IAccountManager accountManager)
        {
            _unitOfWork = unitOfWork;
            _accountManager = accountManager;
        }


        /// <summary>
        /// Gets a specific amount of groups for a specific amount of pages
        /// </summary>
        /// <param name="page">Defines which page of groups should be returned</param>
        /// <param name="pageSize">Defines how many groups should be returned</param>
        /// <returns>A list of groups for a specified page with a specified page size</returns>
        [HttpGet]
        [Route("{page?}/{pageSize?}")]
        [Produces(typeof(List<GroupResource>))]
        public IActionResult GetGroups(int? page, int? pageSize)
        {
            var groups = _unitOfWork.Groups.GetAll();
            var groupsViewModel = new List<GroupResource>();
            foreach (var group in groups)
            {
                var groupResource = new GroupResource
                {
                    Id = group.Id,
                    Name = group.Name,
                    UsersCount = _unitOfWork.GroupUsers.GetAmountOfMembersInGroup(group),
                    Members = Mapper.Map<IEnumerable<UserResource>>(_unitOfWork.GroupUsers.GetMembersForGroup(group))
                };
                groupsViewModel.Add(groupResource);
            }

            return Ok(groupsViewModel);
        }


        /// <summary>
        /// Updates the group specified with the id
        /// </summary>
        /// <param name="groupId">The id of the group</param>
        /// <param name="groupResource">The resource used for updating the group</param>
        /// <returns>The updated group</returns>
        [HttpPut("{groupId}")]
        [Authorize(Authorization.Policies.ManageAllGroupsPolicy)]
        public IActionResult UpdateGroup(string groupId, [FromBody] GroupResource groupResource)
        {
            if (ModelState.IsValid)
            {
                if (groupResource == null)
                    return BadRequest($"{nameof(groupResource)} cannot be null");

                if (!string.IsNullOrWhiteSpace(groupResource.Id) && groupId != groupResource.Id)
                    return BadRequest("Conflicting group id in parameter and model data");

                Group group = _unitOfWork.Groups.GetGroupWithMembers(groupResource.Id);

                if (group == null)
                    return NotFound(groupId);
                    
                group.Name = groupResource.Name;
                _unitOfWork.Groups.Update(group);

                _unitOfWork.GroupUsers.RemoveRange(group.GroupUsers);

                foreach (var member in groupResource.Members)
                {
                    GroupUser groupUser = new GroupUser
                    {
                        GroupId = group.Id,
                        MemberId = member.Id
                    };

                    _unitOfWork.GroupUsers.Add(groupUser);
                }
                _unitOfWork.SaveChanges();

                var editedGroup = _unitOfWork.Groups.GetGroupWithMembers(group.Id);
                var membersResource = new List<UserResource>();

                foreach (var groupUser in editedGroup.GroupUsers)
                {
                    var member = Mapper.Map<UserResource>(Task.Run(async () => { return await _accountManager.GetUserByIdAsync(groupUser.MemberId); }).Result);
                    membersResource.Add(member);
                }
                

                var editedGroupResource = new GroupResource
                {
                    Id = group.Id,
                    Name = group.Name,
                    Members = membersResource,
                    UsersCount = membersResource.Count
                };

                return Ok(editedGroupResource);

            }

            return BadRequest(ModelState);
        }



        /// <summary>
        /// Creates a new group
        /// </summary>
        /// <param name="groupResource">The resource used for creating the group</param>
        /// <returns>The created group</returns>
        [HttpPost]
        [Authorize(Authorization.Policies.ManageAllGroupsPolicy)]
        public IActionResult CreateGroup([FromBody] GroupResource groupResource)
        {
            if (ModelState.IsValid)
            {
                if (groupResource == null)
                    return BadRequest($"{nameof(groupResource)} cannot be null");


                Group group = new Group
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = groupResource.Name,
                };

                var groupUsers = new List<GroupUser>();

                foreach (var member in groupResource.Members)
                {
                    GroupUser groupUser = new GroupUser
                    {
                        GroupId = group.Id,
                        MemberId = member.Id
                    };
                    groupUsers.Add(groupUser);
                }


                _unitOfWork.Groups.Add(group);
                _unitOfWork.GroupUsers.AddRange(groupUsers);
                _unitOfWork.SaveChanges();

                groupResource.Id = group.Id;
                return Ok(groupResource);
            }
            else
            {
                return BadRequest(ModelState);
            }


        }



        /// <summary>
        /// Deletes the group specified with the id
        /// </summary>
        /// <param name="groupId">The id of the group</param>
        /// <returns>The deleted group</returns>
        [HttpDelete("{groupId}")]
        [Produces(typeof(GroupResource))]
        [Authorize(Authorization.Policies.ManageAllGroupsPolicy)]
        public IActionResult DeleteGroup(string groupId)
        {
            GroupResource groupResource = null;
            Group group = _unitOfWork.Groups.GetGroupWithMembers(groupId);

            var membersResource = new List<UserResource>();

            if (group != null)

                foreach (var groupUser in group.GroupUsers)
                {
                    var member = Mapper.Map<UserResource>(Task.Run(async () => { return await _accountManager.GetUserByIdAsync(groupUser.MemberId); }).Result);
                    membersResource.Add(member);
                }

                groupResource = new GroupResource
                {
                    Id = group.Id,
                    Name = group.Name,
                    Members = membersResource,
                    UsersCount = membersResource.Count
                };

            if (groupResource == null)
                return NotFound(groupId);

            var groupUsersToDelete = _unitOfWork.GroupUsers.Find(gu => gu.GroupId == group.Id);
            if (groupUsersToDelete != null)
                _unitOfWork.GroupUsers.RemoveRange(groupUsersToDelete);

            _unitOfWork.Groups.Remove(group);
            _unitOfWork.SaveChanges();

            return Ok(groupResource);
        }



        /// <summary>
        /// Gets all the members of the group specified with the id
        /// </summary>
        /// <param name="groupId">The id of the group</param>
        /// <returns>A list of members</returns>
        [HttpGet("{groupId}/members")]
        [Authorize(Authorization.Policies.ViewAllGroupsPolicy)]
        [Produces(typeof(List<UserResource>))]
        public IActionResult GetMembers(string groupId)
        {
            var group = _unitOfWork.Groups.GetSingleOrDefault(g => g.Id == groupId);
            var membersForGroup = _unitOfWork.GroupUsers.GetMembersForGroup(group);

            return Ok(Mapper.Map<IEnumerable<UserResource>>(membersForGroup));
        }


    }
}