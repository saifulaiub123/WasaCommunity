using DAL.Models;
using DAL.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;

namespace DAL.Repositories
{
    public class FrontendErrorLogRepository : Repository<FrontendErrorLog>, IFrontendErrorLogRepository
    {
        private ApplicationDbContext _appContext => (ApplicationDbContext)_context;
        public FrontendErrorLogRepository(DbContext context) : base(context)
        { }

    }
}
