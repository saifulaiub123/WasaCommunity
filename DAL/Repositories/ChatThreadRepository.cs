using DAL.Models;
using DAL.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace DAL.Repositories
{
    public class ChatThreadRepository : Repository<ChatThread>, IChatThreadRepository
    {
        private ApplicationDbContext _appContext => (ApplicationDbContext)_context;
        public ChatThreadRepository(DbContext context) : base(context)
        { }

        public ChatThread GetChatThreadWithOwner(int id)
        {
            return _appContext.ChatThreads
                .Where(ct => ct.Id == id)
                .Include(ct => ct.Owner)
                .SingleOrDefault();

        }

        public ChatThread GetChatThreadForOwnerAndReceiver(string ownerId, string receiverId)
        {
            return _appContext.ChatThreads
                .Where(ct => ct.OwnerId == ownerId && ct.ReceiverId == receiverId)
                .FirstOrDefault();
        }
    }
}


