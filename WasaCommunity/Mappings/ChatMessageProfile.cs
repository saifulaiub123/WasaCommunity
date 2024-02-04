// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

using AutoMapper;
using DAL.Models;
using System;
using System.Collections.Generic;
using WasaCommunity.Resources;

namespace WasaCommunity.Mappings
{
    public class ChatMessageProfile : Profile
    {
        public ChatMessageProfile()
        {
            CreateMap<ChatMessage, LastMessageResource>();

            CreateMap<ChatMessage, ChatMessageResource>()
                .ForMember(cmr => cmr.Author, map => map.MapFrom(cm => Mapper.Map<MinimalUserResource>(cm.Author)))
                .ForMember(cmr => cmr.Receiver, map => map.MapFrom(cm => Mapper.Map<MinimalUserResource>(cm.Receiver)))
                .ForMember(cmr => cmr.Thread, map => map.MapFrom(cm => Mapper.Map<ChatThreadResource>(cm.ChatThread)));

            CreateMap<ChatMessageResource, ChatMessage>()
                .ForMember(cm => cm.SentAt, map => map.ResolveUsing(cmr => new DateTimeOffset(DateTimeOffset.UtcNow.UtcDateTime)))
                .ForMember(cm => cm.Author, map => map.MapFrom(cmr => Mapper.Map<User>(cmr.Author)))
                .ForMember(cm => cm.Receiver, map => map.MapFrom(cmr => Mapper.Map<User>(cmr.Receiver)));
        }
    }
}
