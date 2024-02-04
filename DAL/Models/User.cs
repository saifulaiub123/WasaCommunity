// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using DAL.Models.Interfaces;
using System.ComponentModel.DataAnnotations;

namespace DAL.Models
{
    public class User : IdentityUser, IAuditableEntity
    {
        public virtual string FriendlyName
        {
            get
            {
                string friendlyName = string.IsNullOrWhiteSpace(FullName) ? UserName : FullName;

                if (!string.IsNullOrWhiteSpace(JobTitle))
                    friendlyName = $"{JobTitle} {friendlyName}";

                return friendlyName;
            }
        }


        public string JobTitle { get; set; }
        public string FullName { get; set; }
        public string Configuration { get; set; }
        public bool IsEnabled { get; set; }
        public bool IsLockedOut => this.LockoutEnabled && this.LockoutEnd >= DateTimeOffset.UtcNow;

        public string CreatedBy { get; set; }
        public string UpdatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime UpdatedDate { get; set; }
        
        [Required]
        public string ImageUrl { get; set; }

        [Required]
        public int AppointmentStatus { get; set; } = 5;


        /// <summary>
        /// Navigation property for the roles this user belongs to.
        /// </summary>
        public virtual ICollection<IdentityUserRole<string>> Roles { get; set; }

        /// <summary>
        /// Navigation property for the claims this user possesses.
        /// </summary>
        public virtual ICollection<IdentityUserClaim<string>> Claims { get; set; }

        /// <summary>
        /// Navigation property for the calendar-appointments this user possesses.
        /// </summary>
        public ICollection<CalendarAppointment> CalendarAppointments { get; set; } = new List<CalendarAppointment>();
        public ICollection<ChatMessage> AuthoredChatMessages { get; set; } = new List<ChatMessage>();
        public ICollection<ChatMessage> ReceivedChatMessages { get; set; } = new List<ChatMessage>();
        public ICollection<AlertMessage> AuthoredAlerts { get; set; } = new List<AlertMessage>();
        public ICollection<AlertRecipient> AlertRecipients { get; set; } = new List<AlertRecipient>();
        public ICollection<ChatThread> OwnedChatThreads { get; set; } = new List<ChatThread>();
        public ICollection<ChatThread> ReceivedChatThreads { get; set; } = new List<ChatThread>();
        public ICollection<GroupUser> GroupUsers { get; set; } = new List<GroupUser>();
    }
}
