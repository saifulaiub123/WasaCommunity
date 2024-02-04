using System;
using System.ComponentModel.DataAnnotations;

namespace DAL.Models
{
    public class CalendarAppointment
    {
        [Required]
        public string Id { get; set; }

        [Required]
        public string UniqueId { get; set; }

        public string Text { get; set; }

        [Required]
        public DateTimeOffset StartDate { get; set; }

        [Required]
        public DateTimeOffset EndDate { get; set; }

        [Required]
        public string StartDateTimeZone { get; set; }

        [Required]
        public string EndDateTimeZone { get; set; }

        [Required]
        [Range(0, 5)]
        public int FreeBusy { get; set; }

        [Required]
        public User User { get; set; }

        [Required]
        public string UserId { get; set; }

        [Required]
        public bool AllDay { get; set; }

    }


}