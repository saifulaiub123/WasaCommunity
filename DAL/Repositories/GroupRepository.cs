using DAL.Models;
using DAL.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace DAL.Repositories
{
    public class GroupRepository : Repository<Group>, IGroupRepository
    {
        private ApplicationDbContext _appContext => (ApplicationDbContext)_context;
        public GroupRepository(DbContext context) : base(context)
        { }

        public Group GetGroupWithMembers(string id)
        {
            return _appContext.Groups
                .Include(g => g.GroupUsers)
                .Where(g => g.Id == id)
                .SingleOrDefault();
        }
    }
}
