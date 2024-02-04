// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

using System;
using System.ComponentModel.DataAnnotations;

namespace WasaCommunity.Resources
{
    /// <summary>
    /// Represents a calendar appointment
    /// </summary>
    public class CalendarAppointmentResource
    {
        /// <summary>
        /// The title of the appointment
        /// </summary>
        public string Text { get; set; }

        /// <summary>
        /// The date and time of when the appointment starts
        /// </summary>
        [Required]
        public DateTime StartDate { get; set; }

        /// <summary>
        /// The date and time of when the apointment ends
        /// </summary>
        [Required]
        public DateTime EndDate { get; set; }

        /// <summary>
        /// The number indicating which availability status is set on the appointment (0: On Vacation, 1: In a preliminary meeting, 2: Busy in a meeting, 3: Out of office, 4: Working elsewhere, 5: Not in a meeting) 
        /// </summary>
        [Required]
        [Range(0, 5)]
        public int FreeBusy { get; set; }

        /// <summary>
        /// The id of the user which the appointment belongs to
        /// </summary>
        [Required]
        public string UserId { get; set; }

        /// <summary>
        /// Indicates whether the appointment is an all day event
        /// </summary>
        [Required]
        public bool AllDay { get; set; }

    }
}