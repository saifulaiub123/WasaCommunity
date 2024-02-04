// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

using DAL.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Threading;
using DAL.Models.Interfaces;
using Microsoft.AspNetCore.Identity;
using Newtonsoft.Json;

namespace DAL
{
    public class ApplicationDbContext : IdentityDbContext<User, Role, string>
    {
        public string CurrentUserId { get; set; }
        public DbSet<CalendarAppointment> Appointments { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }
        public DbSet<ChatThread> ChatThreads { get; set; }
        public DbSet<AlertMessage> AlertMessages { get; set; }
        public DbSet<AlertRecipient> AlertRecipients { get; set; }
        public DbSet<Group> Groups { get; set; }
        public DbSet<GroupUser> GroupUsers { get; set; }
        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<BackendErrorLog> BackendErrorLogs { get; set; }
        public DbSet<FrontendErrorLog> FrontendErrorLogs { get; set; }
        public DbSet<UsageLog> UsageLogs { get; set; }
        public DbSet<PerformanceLog> PerformanceLogs { get; set; }
        public DbSet<PushNotificationSubscriber> NotificationSubscribers { get; set; }


        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        { }


        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<IdentityRoleClaim<string>>().ToTable("RoleClaims");
            builder.Entity<Role>().ToTable("Roles");
            builder.Entity<IdentityUserClaim<string>>().ToTable("UserClaims");
            builder.Entity<IdentityUserLogin<string>>().ToTable("UserLogins");
            builder.Entity<IdentityUserRole<string>>().ToTable("UserRoles");
            builder.Entity<User>().ToTable("Users");
            builder.Entity<IdentityUserToken<string>>().ToTable("UserTokens");
            builder.Entity<CalendarAppointment>().ToTable("Appointments");


            builder.Entity<User>().HasMany(u => u.Claims).WithOne().HasForeignKey(c => c.UserId).IsRequired().OnDelete(DeleteBehavior.Cascade);
            builder.Entity<User>().HasMany(u => u.Roles).WithOne().HasForeignKey(r => r.UserId).IsRequired().OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Role>().HasMany(r => r.Claims).WithOne().HasForeignKey(c => c.RoleId).IsRequired().OnDelete(DeleteBehavior.Cascade);
            builder.Entity<Role>().HasMany(r => r.Users).WithOne().HasForeignKey(r => r.RoleId).IsRequired().OnDelete(DeleteBehavior.Cascade);

            // Chat
            builder.Entity<ChatMessage>()
                .HasOne(cm => cm.ChatThread)
                .WithMany(ct => ct.ChatMessages)
                .HasForeignKey(cm => cm.ChatThreadId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<ChatMessage>()
                .HasOne(cm => cm.Author)
                .WithMany(a => a.AuthoredChatMessages)
                .HasForeignKey(cm => cm.AuthorId);

            builder.Entity<ChatMessage>()
                .HasOne(cm => cm.Receiver)
                .WithMany(a => a.ReceivedChatMessages)
                .HasForeignKey(cm => cm.ReceiverId)
                .OnDelete(DeleteBehavior.Restrict);


            builder.Entity<User>()
                .HasMany(u => u.AuthoredChatMessages)
                .WithOne(cm => cm.Author);

            builder.Entity<User>()
                .HasMany(u => u.ReceivedChatMessages)
                .WithOne(cm => cm.Receiver);


            builder.Entity<ChatThread>()
                .HasMany(ct => ct.ChatMessages)
                .WithOne(cm => cm.ChatThread)
                .HasForeignKey(cm => cm.ChatThreadId);

            builder.Entity<ChatThread>()
                .HasOne(ct => ct.Owner)
                .WithMany(o => o.OwnedChatThreads);

            builder.Entity<ChatThread>()
                .HasOne(ct => ct.Receiver)
                .WithMany(r => r.ReceivedChatThreads)
                .OnDelete(DeleteBehavior.Restrict);


            // Alert
            builder.Entity<AlertRecipient>()
                .HasOne(ar => ar.Alert)
                .WithMany(a => a.AlertRecipients)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<AlertRecipient>()
                .HasOne(ar => ar.Recipient)
                .WithMany(r => r.AlertRecipients)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<User>()
                .HasMany(u => u.AuthoredAlerts)
                .WithOne(a => a.Author);

            builder.Entity<AlertMessage>()
                .HasOne(a => a.Author)
                .WithMany(u => u.AuthoredAlerts)
                .HasForeignKey(a => a.AuthorId);

            // Group
            builder.Entity<GroupUser>()
                .HasOne(gu => gu.Member)
                .WithMany(m => m.GroupUsers)
                .HasForeignKey(gu => gu.MemberId);

            // FrontendErrorLog
            // builder.Entity<FrontendErrorLog>()
            //     .Property(b => b.AdditionalInfo)
            //     .HasConversion(
            //         v => JsonConvert.SerializeObject(v),
            //         v => JsonConvert.DeserializeObject<Dictionary<string, object>>(v));

            // builder.Entity<FrontendErrorLog>()
            //     .Property(b => b.AdditionalErrorInfo)
            //     .HasConversion(
            //         v => JsonConvert.SerializeObject(v),
            //         v => JsonConvert.DeserializeObject<Dictionary<string, object>>(v));

            // UsageLog
            // builder.Entity<UsageLog>()
            //     .Property(b => b.AdditionalInfo)
            //     .HasConversion(
            //         v => JsonConvert.SerializeObject(v),
            //         v => JsonConvert.DeserializeObject<Dictionary<string, object>>(v));

            // Performance
            // builder.Entity<PerformanceLog>()
            //     .Property(b => b.AdditionalInfo)
            //     .HasConversion(
            //         v => JsonConvert.SerializeObject(v),
            //         v => JsonConvert.DeserializeObject<Dictionary<string, string>>(v));                    
        }




        public override int SaveChanges()
        {
            UpdateAuditEntities();
            return base.SaveChanges();
        }


        public override int SaveChanges(bool acceptAllChangesOnSuccess)
        {
            UpdateAuditEntities();
            return base.SaveChanges(acceptAllChangesOnSuccess);
        }


        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default(CancellationToken))
        {
            UpdateAuditEntities();
            return base.SaveChangesAsync(cancellationToken);
        }


        public override Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default(CancellationToken))
        {
            UpdateAuditEntities();
            return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
        }


        private void UpdateAuditEntities()
        {
            var modifiedEntries = ChangeTracker.Entries()
                .Where(x => x.Entity is IAuditableEntity && (x.State == EntityState.Added || x.State == EntityState.Modified));


            foreach (var entry in modifiedEntries)
            {
                var entity = (IAuditableEntity)entry.Entity;
                DateTime now = DateTime.UtcNow;

                if (entry.State == EntityState.Added)
                {
                    entity.CreatedDate = now;
                    entity.CreatedBy = CurrentUserId;
                }
                else
                {
                    base.Entry(entity).Property(x => x.CreatedBy).IsModified = false;
                    base.Entry(entity).Property(x => x.CreatedDate).IsModified = false;
                }

                entity.UpdatedDate = now;
                entity.UpdatedBy = CurrentUserId;
            }
        }
    }
}
