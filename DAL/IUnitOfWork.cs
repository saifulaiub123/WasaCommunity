// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

using DAL.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL
{
    public interface IUnitOfWork
    {
        IAppointmentRepository Appointments { get; }
        IChatMessageRepository ChatMessages { get; }
        IChatThreadRepository ChatThreads { get; }
        IAlertRepository Alerts { get; }
        IAlertRecipientRepository AlertRecipients { get; }
        IGroupRepository Groups { get; }
        IGroupUserRepository GroupUsers { get; }
        IInvoiceRepository Invoices { get; }
        IOrderRepository Orders { get; }
        IBackendErrorLogRepository BackendErrorLogs { get; }
        IFrontendErrorLogRepository FrontendErrorLogs { get; }
        IUsageLogRepository UsageLogs { get; }
        IPerformanceLogRepository PerformanceLogs { get; }
        IPushNotificationSubscriberRepository NotificationSubscribers { get; }

        int SaveChanges();
    }
}
