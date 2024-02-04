// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

using AutoMapper;
using DAL.Core;
using DAL.Models;
using Microsoft.AspNetCore.Identity;
using WasaCommunity.Resources;

namespace WasaCommunity.Mappings
{
    public class RoleProfile : Profile
    {
        public RoleProfile()
        {
            CreateMap<Role, RoleResource>()
                    .ForMember(d => d.Permissions, map => map.MapFrom(s => s.Claims))
                    .ForMember(d => d.UsersCount, map => map.ResolveUsing(s => s.Users?.Count ?? 0))
                    .ReverseMap();
            CreateMap<RoleResource, Role>();

            CreateMap<IdentityRoleClaim<string>, ClaimResource>()
                .ForMember(d => d.Type, map => map.MapFrom(s => s.ClaimType))
                .ForMember(d => d.Value, map => map.MapFrom(s => s.ClaimValue))
                .ReverseMap();

            CreateMap<IdentityRoleClaim<string>, PermissionResource>()
                    .ConvertUsing(s => Mapper.Map<PermissionResource>(ApplicationPermissions.GetPermissionByValue(s.ClaimValue)));
        }
    }
}
