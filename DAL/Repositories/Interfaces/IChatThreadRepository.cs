using DAL.Models;
using System.Collections.Generic;

namespace DAL.Repositories.Interfaces
{
    public interface IChatThreadRepository : IRepository<ChatThread>
    {
        ChatThread GetChatThreadWithOwner(int id);
        ChatThread GetChatThreadForOwnerAndReceiver(string ownerId, string receiverId);
    }
}