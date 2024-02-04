using System.Collections.Generic;
using AutoMapper;
using DAL;
using IdentityServer4.AccessTokenValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WasaCommunity.Resources;

namespace WasaCommunity.Controllers
{
    /// <summary>
    /// The endpoint used for actions regarding chat threads and their resources
    /// </summary>
    [Authorize(AuthenticationSchemes = IdentityServerAuthenticationDefaults.AuthenticationScheme)]
    [Route("/api/users/{userId}/chatthreads/{chatThreadId}")]
    public class ChatThreadsController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        public ChatThreadsController(IUnitOfWork unitOfWork)
        {
            this._unitOfWork = unitOfWork;

        }

        /// <summary>
        /// Marks the chat-messages as read for the thread with the specified id
        /// </summary>
        /// <param name="userId">The id of the user</param>
        /// <param name="chatThreadId">The id of the chat-thread</param>
        /// <returns>All chatmessages that have been marked as read</returns>
        [HttpPut("chatmessages/markallread")]
        [Produces(typeof(List<ChatMessageResource>))]
        public IActionResult MarkChatMessagesAsReadForThread(string userId, int chatThreadId)
        {
            var chatMessagesForThread = _unitOfWork.ChatMessages.Find(cm => cm.ChatThreadId == chatThreadId);

            if (chatMessagesForThread == null)
                return NotFound();

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