using DAL.Models;
using System.Collections.Generic;

namespace DAL.Repositories.Interfaces
{
    public interface IChatMessageRepository : IRepository<ChatMessage>
    {
        ChatMessage GetLatestMessageForThread(ChatThread chatThread);
        IEnumerable<ChatMessage> GetChatMessagesForUser(string id);
        IEnumerable<ChatMessage> GetChatMessagesWithIncludedDataForUser(string userId);
    }
}