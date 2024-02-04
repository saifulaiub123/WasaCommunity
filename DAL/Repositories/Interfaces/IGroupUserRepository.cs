using DAL.Models;
using System.Collections.Generic;

namespace DAL.Repositories.Interfaces
{
    public interface IGroupUserRepository : IRepository<GroupUser>
    {
        int GetAmountOfMembersInGroup(Group group);
        List<User> GetMembersForGroup(Group group);
    }
}