using DAL.Models;
using System.Collections.Generic;

namespace DAL.Repositories.Interfaces
{
    public interface IGroupRepository : IRepository<Group>
    {
        Group GetGroupWithMembers(string id);
    }
}