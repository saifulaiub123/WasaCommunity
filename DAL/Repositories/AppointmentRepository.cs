using DAL.Models;
using DAL.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace DAL.Repositories
{
    public class AppointmentRepository : Repository<CalendarAppointment>, IAppointmentRepository
    {
        private ApplicationDbContext _appContext => (ApplicationDbContext)_context;
        public AppointmentRepository(DbContext context) : base(context)
        { }

        public bool Exists(CalendarAppointment appointment)
        {
           return _appContext.Appointments.Any(a => a.Id == appointment.Id);
        }

        public List<CalendarAppointment> GetAppointmentsWithoutTracking()
        {
            return _appContext.Appointments.Include(a => a.User).AsNoTracking().ToList();
        }

        public List<CalendarAppointment> GetAppointments()
        {
            return _appContext.Appointments.Include(a => a.User).ToList();
        }

        public List<CalendarAppointment> GetAppointmentsForUser(string id)
        {
            return _appContext.Appointments.Include(a => a.User).Where(a => a.UserId == id).ToList();
        }
    }
}
