// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using DAL;
using DAL.Core.Interfaces;
using DAL.Models;
using Microsoft.Exchange.WebServices.Data;
using Microsoft.Extensions.Logging;
using WasaCommunity.Helpers.Exchange;
using System.Xml.Linq;
using Microsoft.EntityFrameworkCore;
using System.IO;
using TimeZoneConverter;
using NodaTime;

namespace WasaCommunity.Services
{
    public interface IExchange
    {
        System.Threading.Tasks.Task FetchAndUpdateAppointmentsAsync();
    }

    public class Exchange : IExchange
    {
        private IAccountManager _accountManager;
        private IUnitOfWork _unitOfWork;
        private ILogger<Exchange> _logger;
        private List<User> _users = new List<User>();



        public Exchange(ILogger<Exchange> logger, IAccountManager accountManager, IUnitOfWork unitofWork)
        {
            _accountManager = accountManager;
            _unitOfWork = unitofWork;
            _logger = logger;

        }

        public async System.Threading.Tasks.Task FetchAndUpdateAppointmentsAsync()
        {
            string email = "dashboard@wasasweden.se";
            string password = "MDuYbzYdu";

            var appointmentsFromDatabase = new List<CalendarAppointment>();
            var appointmentsFromExchange = new List<CalendarAppointment>();

            appointmentsFromDatabase = _unitOfWork.Appointments.GetAppointments();

            _logger.LogInformation("Fetching appointments from Exchange");
            ExchangeService service = Service.ConnectToService(email, password);

            _users.AddRange(FetchUsers());

            foreach (var user in _users)
            {
                var appointmentsForUser = FetchAppointmentsForUser(service, user);

                if (appointmentsForUser != null)
                {
                    foreach (var appointment in appointmentsForUser)
                    {
                        string startZone, endZone;
                        FormatTimeZone(appointment, out startZone, out endZone);
                        
                        // Convert start & end of each appointment to a ZonedDateTime using NodaTime
                        Instant startInstant = Instant.FromDateTimeOffset(appointment.Start);
                        Instant endInstant = Instant.FromDateTimeOffset(appointment.End);

                        DateTimeZone startDateTimeZone = DateTimeZoneProviders.Tzdb[startZone]; 
                        DateTimeZone endDateTimeZone = DateTimeZoneProviders.Tzdb[endZone]; 

                        ZonedDateTime zonedStartDate = startInstant.InZone(startDateTimeZone);
                        ZonedDateTime zonedEndDate = endInstant.InZone(startDateTimeZone);

                        var calendarAppointment = new CalendarAppointment
                        {
                            Id = Guid.NewGuid().ToString(),
                            UniqueId = appointment.Id.UniqueId,
                            // Text = string.IsNullOrEmpty(appointment.Subject) ? "No subject" : appointment.Subject,
                            Text = SetAppointmentText(appointment),
                            StartDate = zonedStartDate.ToDateTimeOffset(),
                            EndDate = zonedEndDate.ToDateTimeOffset(),
                            StartDateTimeZone = startZone,
                            EndDateTimeZone = endZone,
                            FreeBusy = (int)appointment.LegacyFreeBusyStatus,
                            AllDay = appointment.IsAllDayEvent,
                            User = user
                        };

                        appointmentsFromExchange.Add(calendarAppointment);

                    }
                }

            }


            try
            {
                _logger.LogInformation("Writing " + appointmentsFromExchange.Count() + " appointments to XML-file...");
                WriteAppointmentsFromExchangeToXml(appointmentsFromExchange);

                _logger.LogInformation("Removing " + appointmentsFromDatabase.Count() + " appointments from database...");
                _unitOfWork.Appointments.RemoveRange(appointmentsFromDatabase);

                _logger.LogInformation("Adding " + appointmentsFromExchange.Count() + " appointments to database");
                _unitOfWork.Appointments.AddRange(appointmentsFromExchange);

                _logger.LogInformation("Saving appointments to database...");
                _unitOfWork.SaveChanges();

            }
            catch (DbUpdateConcurrencyException)
            {
                _logger.LogError("Concurrency conflict occurred");
            }
            catch (Exception ex)
            {
                _logger.LogCritical(ex.Message);
            }

            _logger.LogInformation("Updating appointment-status for users...");
            await UpdateAppointmentStatusForUsers();

        }

        private async System.Threading.Tasks.Task UpdateAppointmentStatusForUsers()
        {
            _logger.LogInformation("Resetting appointment-status for users");

            foreach (var user in FetchUsers())
            {
                user.AppointmentStatus = 5;
                var currentDate = new DateTimeOffset(DateTime.UtcNow);

                foreach (var appointment in _unitOfWork.Appointments.GetAppointmentsForUser(user.Id))
                {
                    if (appointment.StartDate < currentDate && appointment.EndDate > currentDate)
                    {
                        if (user.AppointmentStatus != appointment.FreeBusy)
                        {
                            _logger.LogInformation(user.FullName + " has new appointment-status. Updated from " + user.AppointmentStatus + " to " + appointment.FreeBusy);
                            user.AppointmentStatus = appointment.FreeBusy;
                        }
                    }

                }

                try
                {
                    await _accountManager.UpdateUserAsync(user);
                }
                catch (Exception e)
                {
                    _logger.LogCritical(e.Message);
                }

            }
        }

        private List<User> FetchUsers()
        {
            List<User> users = new List<User>();

            var usersAndRoles = System.Threading.Tasks.Task.Run(async () =>
                                { return await _accountManager.GetUsersAndRolesAsync(-1, -1); }).Result;

            foreach (var item in usersAndRoles)
            {
                var user = item.Item1;
                users.Add(user);
            }
            return users;
        }


        private FindItemsResults<Appointment> FetchAppointmentsForUser(ExchangeService service, User user)
        {
            FindItemsResults<Appointment> appointmentsFromExchange = null;

            try
            {
                service.ImpersonatedUserId = new ImpersonatedUserId(ConnectingIdType.SmtpAddress, user.Email);
            }

            catch (Exception ex)
            {
                _logger.LogError("Impersonation was not successful for " + user.Email);
                _logger.LogError("Error: " + ex.Message);
            }

            var startDate = DateTime.Now.AddMonths(-3);
            var endDate = DateTime.Now.AddMonths(3);
            const int NUM_APPTS = 1000;

            try
            {

                CalendarFolder calendar = System.Threading.Tasks.Task.Run(async () =>
                            { return await CalendarFolder.Bind(service, WellKnownFolderName.Calendar, new PropertySet()); }).Result;
                CalendarView cView = new CalendarView(startDate, endDate, NUM_APPTS);
                cView.PropertySet = new PropertySet(AppointmentSchema.Id, AppointmentSchema.Subject, AppointmentSchema.Start,
                                                    AppointmentSchema.End, AppointmentSchema.LegacyFreeBusyStatus, AppointmentSchema.IsAllDayEvent,
                                                    AppointmentSchema.StartTimeZone, AppointmentSchema.EndTimeZone, AppointmentSchema.Sensitivity);

                appointmentsFromExchange = System.Threading.Tasks.Task.Run(async () =>
                    { return await calendar.FindAppointments(cView); }).Result;
            }
            catch (Exception ex)
            {
                _logger.LogError("Error for " + user.Email + " with message: " + ex.Message);
            }

            return appointmentsFromExchange;


        }

        private void WriteAppointmentsFromExchangeToXml(IEnumerable<CalendarAppointment> appointmentsFromExchange)
        {
            var xmlDocument = new XDocument(
                new XDeclaration("1.0", "utf-8", "yes"),

                new XElement("Appointments",

                from appointment in appointmentsFromExchange
                select new XElement("Appointment", new XAttribute("Id", appointment.Id),
                            new XElement("UniqueId", appointment.UniqueId),
                            new XElement("Text", appointment.Text),
                            new XElement("Start", appointment.StartDate),
                            new XElement("End", appointment.EndDate),
                            new XElement("StartDateTimeZone", appointment.StartDateTimeZone),
                            new XElement("EndDateTimeZone", appointment.EndDateTimeZone),
                            new XElement("FreeBusy", appointment.FreeBusy),
                            new XElement("AllDay", appointment.AllDay),
                            new XElement("User", appointment.User.UserName))
            ));

            try
            {
                xmlDocument.Save("AppointmentsData.xml");
            }
            catch (IOException ex)
            {
                _logger.LogError(ex.Message);
            }

        }

        private void FormatTimeZone(Appointment appointment, out string startZone, out string endZone)
        {
            startZone = "";
            endZone = "";
            try
            {
                TZConvert.TryWindowsToIana(appointment.StartTimeZone.Id, out startZone);
                TZConvert.TryWindowsToIana(appointment.StartTimeZone.Id, out endZone);
            }
            catch (Exception)
            {
                _logger.LogInformation("Could not convert timezone for appointment with title: " + appointment.Subject + ". \nSet default start and end timezone to Europe/Berlin");
            }

            if (startZone == null || startZone == "" || startZone == "Customized Time Zone")
            {
                startZone = "Europe/Berlin";
            }

            if (endZone == null || endZone == "" || endZone == "Customized Time Zone")
            {
                endZone = "Europe/Berlin";
            }
        }

        private string SetAppointmentText(Appointment appointment)
        {
            string appointmentText;
            if (string.IsNullOrEmpty(appointment.Subject) && (int)appointment.Sensitivity != 2) 
            {
                appointmentText = "No Subject";
            }
            if ((int)appointment.Sensitivity == 2) 
            {
                appointmentText = "**Private Appointment**";
            }
            else {
                appointmentText = appointment.Subject;
            }

            return appointmentText;
        }

    }
}