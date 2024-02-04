using DAL.Models;
using DAL.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace DAL.Repositories
{
    public class BackendErrorLogRepository : Repository<BackendErrorLog>, IBackendErrorLogRepository
    {
        private ApplicationDbContext _appContext => (ApplicationDbContext)_context;
        public BackendErrorLogRepository(DbContext context) : base(context)
        { }
    }
}
