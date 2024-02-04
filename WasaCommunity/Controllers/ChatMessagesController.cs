using System;
using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using DAL;
using IdentityServer4.AccessTokenValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WasaCommunity.Logging;
using WasaCommunity.Resources;

namespace WasaCommunity.Controllers
{
    /// <summary>
    /// The endpoint used for actions regarding chatmessages and their resources
    /// </summary>
    [Authorize(AuthenticationSchemes = IdentityServerAuthenticationDefaults.AuthenticationScheme)]
    [Route("/api/users/{userId}/chatmessages")]
    public class ChatMessagesController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        public ChatMessagesController(IUnitOfWork unitOfWork)
        {
            this._unitOfWork = unitOfWork;

        }

        /// <summary>
        /// Gets the chatmessages for the user with the specified id
        /// </summary>
        /// <param name="userId">The id of the user</param>
        /// <returns>All chatmessages for the specified user</returns>
        [HttpGet]
        [Produces(typeof(List<ChatMessageResource>))]
        public IActionResult GetChatMessagesForUser(string userId)
        {
            IEnumerable<ChatMessageResource> messages = new List<ChatMessageResource>();
            messages = Mapper.Map<IEnumerable<ChatMessageResource>>(_unitOfWork.ChatMessages.GetChatMessagesWithIncludedDataForUser(userId));

            return Ok(messages);
        }

        /// <summary>
        /// Marks the chat-messages as read for the current thread
        /// </summary>
        /// <param name="userId">The id of the user</param>
        /// <returns>All chatmessages that have been marked as read</returns>
        [HttpPut("markallread")]
        [Produces(typeof(List<ChatMessageResource>))]
        public IActionResult MarkChatMessagesForThreadAsRead(string userId)
        {
            var chatMessagesForThread = _unitOfWork.ChatMessages.Find(cm => cm.ReceiverId == userId).Where(cm => cm.IsRead == false).ToList();

            // if (chatMessagesForThread == null)
            //     return NotFound();

            foreach (var chatMessage in chatMessagesForThread)
            {
                chatMessage.IsRead = true;
                _unitOfWork.ChatMessages.Update(chatMessage);
            }

            _unitOfWork.SaveChanges();

            return Ok(Mapper.Map<IEnumerable<ChatMessageResource>>(chatMessagesForThread));
        }
    }
}