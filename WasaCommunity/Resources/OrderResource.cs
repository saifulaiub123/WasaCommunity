using System.ComponentModel.DataAnnotations;

namespace WasaCommunity.Resources
{
    public class OrderResource
    {
        [Required]
        public int OrderNumber { get; set; }

        [Required]
        public int CustomerNumber { get; set; }

        [Required]
        public string CustomerName { get; set; }

        [Required]
        public int OrderAmount { get; set; }
    }
}