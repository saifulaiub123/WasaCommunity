using System;
using System.ComponentModel.DataAnnotations;

namespace DAL.Models
{
    public class Invoice
    {
        [Required]
        public string Id { get; set; }

        [Required]
        public bool IsCredit { get; set; }

        [Required]
        public int InvoiceNumber { get; set; }

        [Required]
        public string CompanyName { get; set; }

        [Required]
        public string Warehouse { get; set; }
        public DateTime? InvoiceDate { get; set; }
        public DateTime? ExpiryDate { get; set; }

        [Required]
        public int Amount { get; set; }

    }
}
