using DAL.Models;
using DAL.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace DAL.Repositories
{
    public class AlertRepository : Repository<AlertMessage>, IAlertRepository
    {
        private ApplicationDbContext _appContext => (ApplicationDbContext)_context;
        public AlertRepository(DbContext context) : base(context)
        { }

        public IEnumerable<AlertMessage> GetAlertsWithAuthorAndRecipients()
        {
            return _appContext.AlertMessages
                .Include(a => a.Author)
                .Include(a => a.AlertRecipients)
                .ToList();
        }

        public AlertMessage GetAlertWithAuthorAndRecipients(string id)
        {
            return _appContext.AlertMessages
                .Include(a => a.Author)
                .Include(a => a.AlertRecipients)
                .Where(a => a.Id == id)
                .FirstOrDefault();
        }
    }
}
