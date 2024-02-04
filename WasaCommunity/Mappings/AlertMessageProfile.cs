// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

using AutoMapper;
using DAL.Models;
using System.Collections.Generic;
using WasaCommunity.Resources;

namespace WasaCommunity.Mappings
{
    public class AlertMessageProfile : Profile
    {
        public AlertMessageProfile()
        {
            CreateMap<AlertMessage, AlertMessageResource>()
                .ForMember(d => d.Author, map => map.MapFrom(s => Mapper.Map<MinimalUserResource>(s.Author)))
                .ForMember(d => d.Recipients, map => map.MapFrom(s => Mapper.Map<IEnumerable<AlertRecipientResource>>(s.AlertRecipients)))
                .ReverseMap();
        }
    }
}
