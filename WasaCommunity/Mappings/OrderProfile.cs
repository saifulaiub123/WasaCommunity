// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

using AutoMapper;
using DAL.Models;
using WasaCommunity.Resources;

namespace WasaCommunity.Mappings
{
    public class OrderProfile : Profile
    {
        public OrderProfile()
        {
            CreateMap<Order, OrderResource>();
        }
    }
}
