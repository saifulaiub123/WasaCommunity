using DAL.Models;
using DAL.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace DAL.Repositories
{
    public class AlertReceiverRepository : Repository<AlertRecipient>, IAlertRecipientRepository
    {
        private ApplicationDbContext _appContext => (ApplicationDbContext)_context;
        public AlertReceiverRepository(DbContext context) : base(context)
        { }

    }
}
