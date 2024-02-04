using System;
using System.ComponentModel.DataAnnotations;

namespace DAL.Models
{
    public class Order
    {
        [Required]
        public string Id { get; set; }

        [Required]
        public int OrderNumber { get; set; }

        [Required]
        public int CustomerNumber { get; set; }

        [Required]
        public string CustomerName { get; set; }
        public DateTime? RegistrationDate { get; set; }

        [Required]
        public string SalesPerson { get; set; }

        [Required]
        public string Email { get; set; }
        public DateTime? InvoicedDate { get; set; }
        public int InvoicedAmount { get; set; }
        public int RemainingAmount { get; set; }

        [Required]
        public int OrderAmount { get; set; }

    }
}