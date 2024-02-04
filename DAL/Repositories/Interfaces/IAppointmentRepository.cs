using DAL.Models;
using System.Collections.Generic;

namespace DAL.Repositories.Interfaces
{
    public interface IAppointmentRepository : IRepository<CalendarAppointment>
    {
        bool Exists(CalendarAppointment appointment);
        List<CalendarAppointment> GetAppointmentsWithoutTracking();
        List<CalendarAppointment> GetAppointments();
        List<CalendarAppointment> GetAppointmentsForUser(string id);
    }
}