// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

using DAL.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DAL.Core;
using DAL.Core.Interfaces;

namespace DAL
{
    public interface IDatabaseInitializer
    {
        Task SeedAsync();
    }




    public class DatabaseInitializer : IDatabaseInitializer
    {
        private readonly ApplicationDbContext _context;
        private readonly IAccountManager _accountManager;
        private readonly ILogger _logger;

        public DatabaseInitializer(ApplicationDbContext context, IAccountManager accountManager, ILogger<DatabaseInitializer> logger)
        {
            _accountManager = accountManager;
            _context = context;
            _logger = logger;
        }

        virtual public async Task SeedAsync()
        {
            await _context.Database.MigrateAsync().ConfigureAwait(false);

            if (!await _context.Users.AnyAsync())
            {
                _logger.LogInformation("Generating inbuilt accounts");
                const string adminRoleName = "administrator";
                const string userRoleName = "user";
                const string websiteManagerRoleName ="website manager";

                await EnsureRoleAsync(adminRoleName, "Default administrator", ApplicationPermissions.GetAdministrativePermissionValues());
                await EnsureRoleAsync(userRoleName, "Default user", new string[] { });
                await EnsureRoleAsync(websiteManagerRoleName, "Website manager", ApplicationPermissions.GetAllPermissionValues());

                var isak = await CreateUserAsync("isak@wasasweden.se", "P@ssw0rd!", "Isak Vidinghoff", "isak@wasasweden.se", "+46 73 728 33 75", "Development", "isak-vidinghoff.png", new string[] { websiteManagerRoleName });
                var pelle = await CreateUserAsync("pelle@wasasweden.se", "P@ssw0rd!", "Pelle Johansson", "pelle@wasasweden.se", "+46 585-318 07", "Management", "pelle-johansson.png", new string[] { adminRoleName });
                var niklas = await CreateUserAsync("niklas@wasasweden.se", "P@ssw0rd!", "Niklas Neuendorff", "niklas@wasasweden.se", "+46 585-318 05", "Management", "niklas-neuendorff.png", new string[] { adminRoleName });
                var madeleine = await CreateUserAsync("madeleine@wasasweden.se", "tempP@ss123", "Madeleine Huhtala", "madeleine@wasasweden.se", "+46 585-318 10", "Sales", "madeleine-huhtala.png", new string[] { userRoleName });
                var anna = await CreateUserAsync("anna@wasasweden.se", "tempP@ss123", "Anna Hamp", "anna@wasasweden.se", "+46 585 31 815", "Sales", "anna-hamp.png", new string[] { userRoleName });
                var johanna = await CreateUserAsync("johanna@wasasweden.se", "tempP@ss123", "Johanna Lindholm", "johanna@wasasweden.se", "+46 585-318 11", "Sales", "johanna-lindholm.png", new string[] { userRoleName });
                var susanna = await CreateUserAsync("susanna@wasasweden.se", "tempP@ss123", "Susanna Qvarfordt", "susanna@wasasweden.se", "+46 585-318 14", "Sales", "susanna-qvarfordt.png", new string[] { userRoleName });
                var sara = await CreateUserAsync("sara@wasasweden.se", "tempP@ss123", "Sara Gustavsson", "sara@wasasweden.se", "+46 585-318 13", "Supply chain manager", "sara-gustavsson.png", new string[] { userRoleName });
                var monica = await CreateUserAsync("monica@wasasweden.se", "tempP@ss123", "Monica Köhlström", "monica@wasasweden.se", "+46 585-318 08", "Purchase", "monica-kohlstrom.png", new string[] { userRoleName });
                var peter = await CreateUserAsync("peter@wasasweden.se", "tempP@ss123", "Peter Qvarnlöf", "peter@wasasweden.se", "+46 706-30 00 32", "IT", "peter-qvarnlof.png", new string[] { userRoleName });
                var ulla = await CreateUserAsync("ulla@wasasweden.se", "tempP@ss123", "Ulla Granlund", "ulla@wasasweden.se", "+46 585-318 09", "Finance", "ulla-granlund.png", new string[] { userRoleName });
                var robert = await CreateUserAsync("robert@wasasweden.se", "tempP@ss123", "Robert Hässelbäck", "robert@wasasweden.se", "+46 585-318 17", "Warehouse & logistic", "robert-hasselback.png", new string[] { userRoleName });
                var marieLouise = await CreateUserAsync("marie-louise@wasasweden.se", "tempP@ss123", "Marie-Louise Andersson", "marie-louise@wasasweden.se", "+46 585-318 30", "Warehouse & logistic", "marielouise-andersson.png", new string[] { userRoleName });
                var lars = await CreateUserAsync("lars@wasasweden.se", "tempP@ss123", "Lars Andersson", "lars@wasasweden.se", "+46 585-318 04", "Technical support", "lars-andersson.png", new string[] { userRoleName });                
                var louise = await CreateUserAsync("louise@wasasweden.se", "tempP@ss123", "Louise Runsten", "louise@wasasweden.se", "+46 585-318 16", "Sales", "louise-runsten.png", new string[] { userRoleName });
                var peder = await CreateUserAsync("peder.styhm@wasasweden.se", "tempP@ss123", "Peder Styhm", "peder.styhm@wasasweden.se", "+45 972 101 08", "Sales Manager Denmark", "peder-styhm.png", new string[] { userRoleName });
                var ronny = await CreateUserAsync("ronny@wasasweden.se", "tempP@ss123", "Ronny Nyman", "ronny@wasasweden.se", "+46 706 25 03 44", "Sales", "ronny-nyman.png", new string[] { userRoleName });
                var stefan = await CreateUserAsync("stefan@wasasweden.se", "tempP@ss123", "Stefan Sülla", "stefan@wasasweden.se", "+46 730 79 74 50", "Sales", "stefan-sulla.png", new string[] { userRoleName });
                var tina = await CreateUserAsync("tina@wasasweden.eu", "tempP@ss123", "Tina Gatterman", "tina@wasasweden.eu", "+49 172 452 71 79", "Sales", "tina-gatterman.png", new string[] { userRoleName });
                var thomas = await CreateUserAsync("thomas@wasasweden.eu", "tempP@ss123", "Thomas Oberndorfer", "thomas@wasasweden.eu", "+49 171 979 40 23", "Sales", "thomas-oberndorfer.png", new string[] { userRoleName });
                var gian = await CreateUserAsync("gian@wasasweden.se", "tempP@ss123", "Gian Lieu", "gian@wasasweden.se", "+46 585-318 20", "Sales", "gian-lieu.png", new string[] { userRoleName });
                var catalina = await CreateUserAsync("catalina@wasasweden.se", "tempP@ss123", "Catalina Bruna", "catalina@wasasweden.se", "+46 585-318 21", "Sales", "catalina-bruna.png", new string[] { userRoleName });

                var edmond = await CreateUserAsync("edmond@wasasweden.com.hk", "tempP@ss123", "Edmond Ng", "edmond@wasasweden.com.hk", "+852 2481 1939", "Warehouse & Logistic", "edmond.png", new string[] { userRoleName });
                var yvonne = await CreateUserAsync("yvonne@wasasweden.com.hk", "tempP@ss123", "Yvonne Chan", "yvonne@wasasweden.com.hk", "+852 2481 1939", "Warehouse & Logistic", "yvonne.png", new string[] { userRoleName });
                var hong = await CreateUserAsync("hong@wasasweden.com.hk", "tempP@ss123", "Hong ", "hong@wasasweden.com.hk", "+852 2481 1939", "Warehouse & Logistic", "hong.png", new string[] { userRoleName });
                var wai = await CreateUserAsync("wai@wasasweden.com.hk", "tempP@ss123", "Wai ", "wai@wasasweden.com.hk", "+852 2481 1939", "Warehouse & Logistic", "wai.png", new string[] { userRoleName });
            
                _logger.LogInformation("Inbuilt account generation completed");

                _logger.LogInformation("Generating Groups");
                var all = new List<User>();
                all.AddRange(new List<User>
                {
                    isak,
                    pelle,
                    niklas,
                    madeleine,
                    anna,
                    johanna,
                    susanna,
                    sara,
                    monica,
                    peter,
                    ulla,
                    robert,
                    marieLouise,
                    lars,
                    louise,
                    peder,
                    ronny,
                    stefan,
                    tina,
                    thomas,
                    gian,
                    catalina,
                    edmond,
                    yvonne,
                    hong,
                    wai
                });

                var fjugesta = new List<User>();
                fjugesta.AddRange(new List<User>
                {
                    isak,
                    pelle,
                    niklas,
                    madeleine,
                    anna,
                    johanna,
                    susanna,
                    sara,
                    monica,
                    peter,
                    ulla,
                    robert,
                    marieLouise,
                    lars
                });

                var borås = new List<User>();
                borås.AddRange(new List<User>
                {
                    louise,
                    ronny,
                    stefan
                });

                var warehouse = new List<User>();
                warehouse.AddRange(new List<User>
                {
                    robert,
                    marieLouise
                });

                GenerateGroupForUsers("Wasa Sweden All", all);
                GenerateGroupForUsers("Wasa Sweden Fjugesta", fjugesta);
                GenerateGroupForUsers("Wasa Sweden Borås", borås);
                GenerateGroupForUsers("Warehouse Fjugesta", warehouse);
                _logger.LogInformation("Group generation completed");


                _logger.LogInformation("Generating alert messages");
                GenerateAlertMessagesForUser(isak, all, 0);
                _logger.LogInformation("Alert messages generation completed");

                _logger.LogInformation("Generating chat messages");
                foreach (var user in all)
                {
                    GenerateChatMessagesBetweenUsers(isak, user);
                }
                _logger.LogInformation("Chat messages generation completed");


            }

        }

        private void GenerateGroupForUsers(string name, List<User> members)
        {
            var group = new Group
            {
                Id = Guid.NewGuid().ToString(),
                Name = name,
            };
            _context.Groups.Add(group);

            foreach (var member in members)
            {
                _context.GroupUsers.Add(
                    new GroupUser
                    {
                        Group = group,
                        Member = member
                    }
                );
            }

            _context.SaveChanges();
                    
        }

        private void GenerateAlertMessagesForUser(User author, List<User> recipients, int sentDaysAgo)
        {

            var alert = new AlertMessage
            {
                Id = Guid.NewGuid().ToString(),
                AuthorId = author.Id,
                Title = "Welcome to Wasa Community!",
                Body = "To change your password, click on your name in the top right corner and choose Profile > Edit > Change Password. Type in your current password twice and click on Save.<br>" + 
                       "While on this page, you can choose to edit other settings about your account as well.<br>" + 
                       "If you click on Preferences you can select which will be your desired home-page and which charts that you want to view on the dashboard-page. More charts will be added here in the future.<br>" +
                       "In the top left corner there's a 'hamburger-menu' that will toggle the left side-navigation. This menu is used to navigate between the different pages.<br><br>" +
                       "<strong>Dashboard</strong><br>" +
                       "This page can be used to view statistics from Pyramid.<br><br>" + 
                       "<strong>People</strong><br>" + 
                       "Use this page to view the employees at Wasa. Quickly locate each persons phone-number or click on the email-address to send an email. You can also see each persons current calendar-status at a glance. Click on <i>Calendar</i> to view detailed information about that persons appointments. Toggle between Day, Work Week and Month to see all appointments within that time frame. Click on <i>Chat</i> to compose a new chat-message to that person.<br><br>" + 
                       "<strong>Chat</strong><br>" + 
                       "All your chat-conversations are listed in the left panel. If you have more conversations than what is currently visible, you can scroll to view older chat-conversations. To see the messages within a conversation, simply click on it and the messages will be rendered in the right panel. To compose a chat-message to a new person click on <i>Create new message</i> and select the recipient by clicking on <i>Select new recipient</i>. After choosing a recipient, simply type your message in the input box and press enter or click on the arrow on the right.<br><br>" +
                       "<strong>Alerts</strong><br>" +
                       "All the alert-messages that have been sent to you are listed here. The envelope indicates whether it has been read or not. Click on <i>Details</i> to view the alert-message and <i>Delete</i> to delete that alert-message.<br>" +
                       "To compose a new alert-message click on <i>Create new alert</i>. Select the people you want to alert, write your message and click send.<br>" +
                       "Additional configuration regarding which alert-messages you want to show can be accessed via the three vertical dots in the top right corner.<br>" + 
                       "You can also search for a specific author to only view the alert-messages that have been sent from that person.<br><br>" + 
                       "<strong>About</strong><br>" +
                       "Information about the current version of the application, and what to do if something goes wrong can be accessed on this page.<br><br>" +
                       "Don't hesitate to contact me if you have questions or ideas of improvement. Have an awesome day and good luck!",
                SentAt = DateTimeOffset.Now.UtcDateTime.AddDays(-sentDaysAgo).ToLocalTime(),
            };

            _context.AlertMessages.Add(alert);

            foreach (var recipient in recipients)
            {
                var alertRecipient = new AlertRecipient
                {
                    Alert = alert,
                    Recipient = recipient,
                    IsRead = false,
                    IsDeleted = false
                };    
                _context.AlertRecipients.Add(alertRecipient);
            }
            
            _context.SaveChanges();
        }

        private void GenerateChatMessagesBetweenUsers(User author, User receiver)
        {
            var chatThreadAuthor = new ChatThread
            {
                Owner = author,
                Receiver = receiver
            };
            var chatThreadReceiver = new ChatThread
            {
                Owner = receiver,
                Receiver = author
            };
            _context.ChatThreads.Add(chatThreadAuthor);
            _context.ChatThreads.Add(chatThreadReceiver);

            _context.ChatMessages.AddRange(
                new ChatMessage
                {
                    Id = Guid.NewGuid().ToString(),
                    SentAt = DateTimeOffset.Now.UtcDateTime.AddMinutes(-0),
                    IsRead = true,
                    Text = "Hi " + receiver.FullName.Split(' ')[0] + "! " + "If you have any ideas of things that would improve Wasa Community, you can write to me here or email me at isak@wasasweden.se. Have a great day!",
                    Author = author,
                    Receiver = receiver,
                    ChatThreadId = chatThreadReceiver.Id
                }
            );
            
            _context.SaveChanges();
        }

        private async Task EnsureRoleAsync(string roleName, string description, string[] claims)
        {
            if ((await _accountManager.GetRoleByNameAsync(roleName)) == null)
            {
                Role applicationRole = new Role(roleName, description);

                var result = await this._accountManager.CreateRoleAsync(applicationRole, claims);

                if (!result.Item1)
                    throw new Exception($"Seeding \"{description}\" role failed. Errors: {string.Join(Environment.NewLine, result.Item2)}");
            }
        }

        private async Task<User> CreateUserAsync(string userName, string password, string fullName, string email, string phoneNumber, string jobTitle, string imageUrl, string[] roles)
        {
            User applicationUser = new User
            {
                UserName = userName,
                FullName = fullName,
                Email = email,
                PhoneNumber = phoneNumber,
                ImageUrl = imageUrl,
                JobTitle = jobTitle,
                EmailConfirmed = true,
                IsEnabled = true

            };

            var result = await _accountManager.CreateUserAsync(applicationUser, roles, password);

            if (!result.Item1)
                throw new Exception($"Seeding \"{userName}\" user failed. Errors: {string.Join(Environment.NewLine, result.Item2)}");


            return applicationUser;
        }
    }
}
