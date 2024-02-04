using DAL.Models;
using System.Collections.Generic;

namespace DAL.Repositories.Interfaces
{
    public interface IAlertRepository : IRepository<AlertMessage>
    {
        IEnumerable<AlertMessage> GetAlertsWithAuthorAndRecipients();
        AlertMessage GetAlertWithAuthorAndRecipients(string id);
    }
}