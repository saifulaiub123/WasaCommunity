using DAL.Models;
using DAL.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace DAL.Repositories
{
    public class GroupUserRepository : Repository<GroupUser>, IGroupUserRepository
    {
        private ApplicationDbContext _appContext => (ApplicationDbContext)_context;
        public GroupUserRepository(DbContext context) : base(context)
        { }

        public int GetAmountOfMembersInGroup(Group group)
        {
            return _appContext.GroupUsers.Where(gu => gu.GroupId == group.Id).Count();
        }

        public List<User> GetMembersForGroup(Group group)
        {
            return _appContext.GroupUsers
                .Where(gu => gu.GroupId == group.Id)
                .Select(gu => gu.Member)
                .ToList();
        }
    }
}
