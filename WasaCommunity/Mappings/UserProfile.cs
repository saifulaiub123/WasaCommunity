// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

using AutoMapper;
using DAL.Models;
using WasaCommunity.Resources;

namespace WasaCommunity.Mappings
{
    public class UserProfile : Profile
    {

        public UserProfile()
        {
            CreateMap<User, UserResource>()
                    .ForMember(d => d.Roles, map => map.Ignore());
            CreateMap<UserResource, User>()
                    .ForMember(d => d.Roles, map => map.Ignore());

            CreateMap<User, UserEditResource>()
                    .ForMember(d => d.Roles, map => map.Ignore());
            CreateMap<UserEditResource, User>()
                    .ForMember(d => d.Roles, map => map.Ignore());

            CreateMap<User, UserPatchResource>()
                    .ReverseMap();

            CreateMap<MinimalUserResource, User>()
                    .ForMember(d => d.Roles, map => map.Ignore())
                    .ForMember(d => d.CalendarAppointments, map => map.Ignore())
                    .ReverseMap();          

        }
        
    }
}
