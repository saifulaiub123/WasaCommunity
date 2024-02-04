using System.Collections.Generic;

namespace WasaCommunity.Resources
{
    public class OrdersByPersonResource
    {
        public string SalesPerson { get; set; }
        public MinimalUserResource User { get; set; }
        public int TotalSumInSek { get; set; }
        public int AmountOfOrders { get; set; }
        public IEnumerable<OrderResource> Orders { get; set; }
    }
}