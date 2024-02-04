using System.Collections.Generic;
using AutoMapper;
using DAL;
using DAL.Models;
using IdentityServer4.AccessTokenValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WasaCommunity.Logging;
using WasaCommunity.Resources;

namespace WasaCommunity.Controllers
{
    /// <summary>
    /// The endpoint used for actions regarding alertmessages and their resources
    /// </summary>
    [Authorize(AuthenticationSchemes = IdentityServerAuthenticationDefaults.AuthenticationScheme)]
    [Route("/api/users/{userId}/alertmessages")]
    public class AlertMessagesController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        public AlertMessagesController(IUnitOfWork unitOfWork)
        {
            this._unitOfWork = unitOfWork;

        }

        /// <summary>
        /// Marks all alertmessages as read for the user specified with the id
        /// </summary>
        /// <param name="userId">The id of the user</param>
        /// <returns>A list of the updated resources</returns>
        [HttpPut("markallread")]
        [Produces(typeof(List<AlertRecipientResource>))]
        public IActionResult MarkAllAlertsForUserAsRead(string userId)
        {
            var alertRecipientsForUser = _unitOfWork.AlertRecipients.Find(ar => ar.RecipientId == userId);

            if (alertRecipientsForUser == null)
                return NotFound();

            foreach (var alertRecipient in alertRecipientsForUser)
            {
                alertRecipient.IsRead = true;
                _unitOfWork.AlertRecipients.Update(alertRecipient);
            }

            _unitOfWork.SaveChanges();

            return Ok(Mapper.Map<IEnumerable<AlertRecipientResource>>(alertRecipientsForUser));
        }


        /// <summary>
        /// Marks the specified alertmessage as deleted for the user specified with the id
        /// </summary>
        /// <param name="alertRecipientResource">The resource used for marking an alertmessage as deleted</param>
        /// <returns>The resource containing the alertmessage that has been marked as deleted</returns>
        [HttpPatch("{alertId}/markdeleted")]
        [Produces(typeof(AlertRecipientResource))]
        public IActionResult MarkAlertMessageAsDeleted([FromBody] AlertRecipientResource alertRecipientResource)
        {
            var alertRecipient = _unitOfWork.AlertRecipients
                .GetSingleOrDefault(ar => ar.RecipientId == alertRecipientResource.RecipientId && ar.AlertId == alertRecipientResource.AlertId);

            if (alertRecipient == null)
                return NotFound();

            alertRecipient.IsDeleted = true;
            _unitOfWork.AlertRecipients.Update(alertRecipient);
            _unitOfWork.SaveChanges();

            return Ok(Mapper.Map<AlertRecipientResource>(alertRecipient));
        }


        /// <summary>
        /// Marks the specified alertmessage as read for the user specified with the id
        /// </summary>
        /// <param name="alertRecipientResource">The resource used for marking an alertmessage as read</param>
        /// <returns>The updated resource</returns>
        [HttpPatch("{alertId}/toggleread")]
        [Produces(typeof(AlertRecipientResource))]
        public IActionResult MarkAlertMessageAsRead([FromBody] AlertRecipientResource alertRecipientResource)
        {
            var alertRecipient = _unitOfWork.AlertRecipients
                .GetSingleOrDefault(ar => ar.RecipientId == alertRecipientResource.RecipientId && ar.AlertId == alertRecipientResource.AlertId);

            if (alertRecipient == null)
                return NotFound();

            alertRecipient.IsRead = !alertRecipient.IsRead;
            _unitOfWork.AlertRecipients.Update(alertRecipient);
            _unitOfWork.SaveChanges();

            return Ok(Mapper.Map<AlertRecipientResource>(alertRecipient));
        }


        /// <summary>
        /// Gets all the alertmessages for the user specified with the id
        /// </summary>
        /// <param name="userId">The id of the user</param>
        /// <returns>A list of all the alertmessages for the user</returns>
        [HttpGet]
        [Produces(typeof(List<AlertMessageResource>))]
        public IActionResult GetAlertMessagesForUser(string userId)
        {
            var alertMessages = _unitOfWork.Alerts.GetAlertsWithAuthorAndRecipients();
            var alertMessagesForUser = new List<AlertMessage>();

            foreach (var alertMessage in alertMessages)
            {
                foreach (var alertRecipient in alertMessage.AlertRecipients)
                {
                    if (alertRecipient.RecipientId == userId) 
                    {
                        alertMessage.AlertRecipients = new List<AlertRecipient>();
                        alertMessage.AlertRecipients.Add(alertRecipient);
                        alertMessagesForUser.Add(alertMessage);
                    }
                }
            }

            return Ok(Mapper.Map<IEnumerable<AlertMessageResource>>(alertMessages));
        }
    }
}