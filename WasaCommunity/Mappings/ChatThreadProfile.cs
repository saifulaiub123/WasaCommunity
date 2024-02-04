// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

using AutoMapper;
using DAL.Models;
using System.Collections.Generic;
using System.Linq;
using WasaCommunity.Resources;

namespace WasaCommunity.Mappings
{
    public class ChatThreadProfile : Profile
    {
        public ChatThreadProfile()
        {
            CreateMap<ChatThread, ChatThreadResource>()
                .ForMember(ctr => ctr.Id, map => map.MapFrom(ct => ct.Owner.Email))
                .ForMember(ctr => ctr.LastMessage, map => map.MapFrom(ct => Mapper.Map<LastMessageResource>(ct.ChatMessages
                                                                .OrderByDescending(cm => cm.SentAt)
                                                                .FirstOrDefault())))
                .ForMember(ctr => ctr.Name, map => map.MapFrom(ct => ct.Owner.FullName))
                .ForMember(ctr => ctr.AvatarSrc, map => map.MapFrom(ct => ct.Owner.ImageUrl));
        }
    }
}
