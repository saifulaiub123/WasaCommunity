using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using DAL;
using DAL.Core.Interfaces;
using DAL.Models;
using IdentityServer4.AccessTokenValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using WasaCommunity.Resources;
using WebPush;

namespace WasaCommunity.Hubs
{
    [Authorize(AuthenticationSchemes = IdentityServerAuthenticationDefaults.AuthenticationScheme)]
    public class CommunicationHub : Hub
    {
        private IAccountManager _accountManager;
        private IUnitOfWork _unitOfWork;
        private ILogger<CommunicationHub> _logger;

        public CommunicationHub(IAccountManager accountManager, IUnitOfWork unitOfWork, ILogger<CommunicationHub> logger)
        {
            _accountManager = accountManager;
            _unitOfWork = unitOfWork;
            _logger = logger;
        }
        public async Task NewChatMessageCreated(ChatMessageResource chatMessageResource)
        {
            var author = await _accountManager.GetUserByIdAsync(chatMessageResource.Author.Id);
            var receiver = await _accountManager.GetUserByEmailAsync(chatMessageResource.Thread.Id);
            var chatThreadForOwner = _unitOfWork.ChatThreads.GetChatThreadForOwnerAndReceiver(author.Id, receiver.Id);
            var chatThreadForReceiver = _unitOfWork.ChatThreads.GetChatThreadForOwnerAndReceiver(receiver.Id, author.Id);

            if (chatThreadForReceiver == null)
            {
                chatThreadForReceiver = new ChatThread { Owner = receiver, Receiver = author };
                _unitOfWork.ChatThreads.Add(chatThreadForReceiver);
            }

            if (chatThreadForOwner == null)
            {
                chatThreadForOwner = new ChatThread { Owner = author, Receiver = receiver };
                _unitOfWork.ChatThreads.Add(chatThreadForOwner);
            }

            var chatMessage = Mapper.Map<ChatMessage>(chatMessageResource);
            chatMessage.ChatThreadId = chatThreadForReceiver.Id;
            chatMessage.ReceiverId = receiver.Id;
            chatMessage.IsRead = false;

            _unitOfWork.ChatMessages.Add(chatMessage);
            _unitOfWork.SaveChanges();

            chatMessageResource.Receiver = Mapper.Map<MinimalUserResource>(receiver);
            chatMessageResource.Author.ImageUrl = author.ImageUrl;

            await Clients.All.SendAsync("chatMessageReceived", chatMessageResource);

            await SendPushNotificationToChatMessageReceiver(chatMessageResource);

        }

        public async Task NewAlertMessageCreated(AlertMessageResource alertMessageVm)
        {

            AlertMessage alert = new AlertMessage
            {
                Id = Guid.NewGuid().ToString(),
                Author = Task.Run(async () => { return await _accountManager.GetUserByIdAsync(alertMessageVm.Author.Id); }).Result,
                Title = alertMessageVm.Title,
                Body = alertMessageVm.Body,
                SentAt = DateTimeOffset.Now.UtcDateTime.ToLocalTime()
            };

            _unitOfWork.Alerts.Add(alert);

            var alertRecipients = new List<AlertRecipient>();

            foreach (var recipient in alertMessageVm.Recipients)
            {
                var alertRecipient = new AlertRecipient
                {
                    Alert = alert,
                    RecipientId = recipient.RecipientId,
                    IsRead = recipient.IsRead,
                    IsDeleted = recipient.IsDeleted
                };
                recipient.AlertId = alert.Id;

                alertRecipients.Add(alertRecipient);

            }

            _unitOfWork.AlertRecipients.AddRange(alertRecipients);
            _unitOfWork.SaveChanges();

            alertMessageVm.Id = alert.Id;
            alertMessageVm.Author.ImageUrl = alert.Author.ImageUrl;
            alertMessageVm.SentAt = alert.SentAt;

            await Clients.All.SendAsync("alertMessageReceived", alertMessageVm);

            await SendPushNotificationsToAlertReceivers(alertMessageVm);

        }

        private async Task SendPushNotificationToChatMessageReceiver(ChatMessageResource chatMessageResource)
        {
            var notificationSubscribersFromDb = _unitOfWork.NotificationSubscribers.GetAll();
            var notificationSubscribers = new List<PushNotificationSubscriber>();

            if (notificationSubscribersFromDb.Any(ns => ns.UserId == chatMessageResource.Receiver.Id))
            {
                notificationSubscribers.AddRange(notificationSubscribersFromDb.Where(ns => ns.UserId == chatMessageResource.Receiver.Id));
            }

            var notificationPayload = JsonConvert.SerializeObject(new
            {
                notification = new
                {
                    title = chatMessageResource.Author.FullName,
                    body = chatMessageResource.Text,
                    icon = "assets/images/" + chatMessageResource.Author.ImageUrl,
                    vibrate = new[] { 100, 50, 100 }
                }
            });

            foreach (var notificationSubscriber in notificationSubscribers)
            {
                var subscription = new PushSubscription(notificationSubscriber.Endpoint, notificationSubscriber.P256dh, notificationSubscriber.Auth);
                await SendPushNotificationAsync(subscription, notificationPayload);
            }
        }

        private async Task SendPushNotificationsToAlertReceivers(AlertMessageResource alertMessageVm)
        {
            var notificationSubscribersFromDb = _unitOfWork.NotificationSubscribers.GetAll();
            var notificationSubscribers = new List<PushNotificationSubscriber>();

            foreach (var recipient in alertMessageVm.Recipients)
            {
                if (notificationSubscribersFromDb.Any(ns => ns.UserId == recipient.RecipientId))
                {
                    notificationSubscribers.AddRange(notificationSubscribersFromDb.Where(ns => ns.UserId == recipient.RecipientId));
                }
            }

            var notificationPayload = JsonConvert.SerializeObject(new
            {
                notification = new
                {
                    title = alertMessageVm.Title,
                    body = alertMessageVm.Body,
                    icon = "assets/images/" + alertMessageVm.Author.ImageUrl,
                    vibrate = new[] { 100, 50, 100 }
                }
            });

            foreach (var notificationSubscriber in notificationSubscribers)
            {
                var subscription = new PushSubscription(notificationSubscriber.Endpoint, notificationSubscriber.P256dh, notificationSubscriber.Auth);
                await SendPushNotificationAsync(subscription, notificationPayload);
            }
        }

        private async Task SendPushNotificationAsync(PushSubscription subscription, string notificationPayload)
        {
            var subject = ConfigHelper.ConnectionString("PushNotifications", "Subject");
            var publicKey = ConfigHelper.ConnectionString("PushNotifications", "PublicKey");
            var privateKey = ConfigHelper.ConnectionString("PushNotifications", "PrivateKey");

            var vapidDetails = new VapidDetails(subject, publicKey, privateKey);

            var webPushClient = new WebPushClient();

            try
            {
                await webPushClient.SendNotificationAsync(subscription, notificationPayload, vapidDetails);
            }
            catch (WebPushException exception)
            {
                _logger.LogError("Unable to send push-notification. Http status code: " + exception.StatusCode);
            }
        }
    }
}