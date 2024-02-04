using DAL;
using DAL.Models;
using IdentityServer4.AccessTokenValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WasaCommunity.Resources;

namespace WasaCommunity.Controllers
{
    /// <summary>
    /// The endpoint used for actions regarding notifications
    /// </summary>
    [Authorize(AuthenticationSchemes = IdentityServerAuthenticationDefaults.AuthenticationScheme)]
    [Route("/api/notifications")]
    public class PushNotificationsController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        public PushNotificationsController(IUnitOfWork unitOfWork)
        {
            this._unitOfWork = unitOfWork;

        }

        [HttpPost("subscribe/{userId}")]
        public IActionResult SaveNotificationSubscriber(string userId, [FromBody] PushNotificationSubscriberResource resource)
        {
            if (!string.IsNullOrEmpty(resource.Endpoint)
                && !string.IsNullOrEmpty(userId) && !string.IsNullOrEmpty(resource.Keys.Auth)
                && !string.IsNullOrEmpty(resource.Keys.P256dh))
            {
                var notificationSubscriber = new PushNotificationSubscriber();
                notificationSubscriber.Endpoint = resource.Endpoint;
                notificationSubscriber.UserId = userId;
                notificationSubscriber.P256dh = resource.Keys.P256dh;
                notificationSubscriber.Auth = resource.Keys.Auth;

                _unitOfWork.NotificationSubscribers.Add(notificationSubscriber);
                _unitOfWork.SaveChanges();
            }

            return Ok();
        }

    }
}