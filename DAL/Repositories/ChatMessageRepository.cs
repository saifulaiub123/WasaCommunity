using DAL.Models;
using DAL.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace DAL.Repositories
{
    public class ChatMessageRepository : Repository<ChatMessage>, IChatMessageRepository
    {
        private ApplicationDbContext _appContext => (ApplicationDbContext)_context;
        public ChatMessageRepository(DbContext context) : base(context)
        { }

        public ChatMessage GetLatestMessageForThread(ChatThread chatThread) {
            return _appContext.ChatMessages
                .Where(cm => cm.ChatThreadId == chatThread.Id)
                .OrderByDescending(cm => cm.SentAt)
                .FirstOrDefault();

        }

        public IEnumerable<ChatMessage> GetChatMessagesForUser(string id)
        {
            return _appContext.ChatMessages
                .Where(cm => cm.AuthorId == id || cm.ReceiverId == id)
                .ToList();
        }

        public IEnumerable<ChatMessage> GetChatMessagesWithIncludedDataForUser(string userId)
        {

            return _appContext.ChatMessages
                .Where(cm => cm.AuthorId == userId || cm.ReceiverId == userId)
                .Include(cm => cm.Author)
                .Include(cm => cm.Receiver)
                .Include(cm => cm.ChatThread)
                .ToList();
        }
    }
}
