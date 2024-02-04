// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

using AutoMapper;
using DAL.Core;
using WasaCommunity.Resources;

namespace WasaCommunity.Mappings
{
    public class PermissionProfile : Profile
    {
        public PermissionProfile()
        {
            CreateMap<ApplicationPermission, PermissionResource>()
                    .ReverseMap();
        }
    }
}
