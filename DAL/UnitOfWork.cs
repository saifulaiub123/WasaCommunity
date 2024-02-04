// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DAL.Repositories;
using DAL.Repositories.Interfaces;

namespace DAL
{
    public class UnitOfWork : IUnitOfWork
    {
        readonly ApplicationDbContext _context;

        IAppointmentRepository _appointments;
        IChatMessageRepository _chatMessages;
        IChatThreadRepository _chatThreads;
        IAlertRepository _alerts;
        IAlertRecipientRepository _alertRecipients;
        IGroupRepository _groups;
        IGroupUserRepository _groupUsers;
        IInvoiceRepository _invoices;
        IOrderRepository _orders;
        IBackendErrorLogRepository _backendErrorLogs;
        IFrontendErrorLogRepository _frontendErrorLogs;
        IUsageLogRepository _usageLogs;
        IPerformanceLogRepository _performanceLogs;
        IPushNotificationSubscriberRepository _notificationSubscribers;

        public UnitOfWork(ApplicationDbContext context)
        {
            _context = context;
        }

        public IAppointmentRepository Appointments
        {
            get
            {
                if (_appointments == null)
                    _appointments = new AppointmentRepository(_context);

                return _appointments;
            }
        }

        public IChatMessageRepository ChatMessages
        {
            get
            {
                if (_chatMessages == null)
                    _chatMessages = new ChatMessageRepository(_context);

                return _chatMessages;
            }
        }

        public IChatThreadRepository ChatThreads
        {
            get
            {
                if (_chatThreads == null)
                    _chatThreads = new ChatThreadRepository(_context);

                return _chatThreads;
            }
        }

        public IAlertRepository Alerts
        {
            get
            {
                if (_alerts == null)
                    _alerts = new AlertRepository(_context);

                return _alerts;
            }
        }

        public IAlertRecipientRepository AlertRecipients
        {
            get
            {
                if (_alertRecipients == null)
                    _alertRecipients = new AlertReceiverRepository(_context);

                return _alertRecipients;
            }
        }

        public IGroupRepository Groups
        {
            get
            {
                if (_groups == null)
                    _groups = new GroupRepository(_context);

                return _groups;
            }
        }

        public IGroupUserRepository GroupUsers
        {
            get
            {
                if (_groupUsers == null)
                    _groupUsers = new GroupUserRepository(_context);

                return _groupUsers;
            }
        }

        public IInvoiceRepository Invoices
        {
            get
            {
                if (_invoices == null)
                    _invoices = new InvoiceRepository(_context);

                return _invoices;
            }
        }

        public IOrderRepository Orders
        {
            get
            {
                if (_orders == null)
                    _orders = new OrderRepository(_context);

                return _orders;
            }
        }

        public IBackendErrorLogRepository BackendErrorLogs
        {
            get
            {
                if (_backendErrorLogs == null)
                    _backendErrorLogs = new BackendErrorLogRepository(_context);

                return _backendErrorLogs;
            }
        }

        public IFrontendErrorLogRepository FrontendErrorLogs
        {
            get
            {
                if (_frontendErrorLogs == null)
                    _frontendErrorLogs = new FrontendErrorLogRepository(_context);

                return _frontendErrorLogs;
            }
        }

        public IUsageLogRepository UsageLogs
        {
            get
            {
                if (_usageLogs == null)
                    _usageLogs = new UsageLogRepository(_context);

                return _usageLogs;
            }
        }

        public IPerformanceLogRepository PerformanceLogs
        {
            get
            {
                if (_performanceLogs == null)
                    _performanceLogs = new PerformanceLogRepository(_context);

                return _performanceLogs;
            }
        }

        public IPushNotificationSubscriberRepository NotificationSubscribers
        {
            get
            {
                if (_notificationSubscribers == null)
                    _notificationSubscribers = new PushNotificationSubscriberRepository(_context);

                return _notificationSubscribers;
            }
        }


        public int SaveChanges()
        {
            return _context.SaveChanges();
        }
    }
}
