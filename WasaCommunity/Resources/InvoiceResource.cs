// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

using System;
using System.ComponentModel.DataAnnotations;

namespace WasaCommunity.Resources
{
    /// <summary>
    /// Represents a resource of an invoice
    /// </summary>
    public class InvoiceResource
    {
        
        /// <summary>
        /// Indicates if the invoice is a credit-invoice
        /// </summary>
        [Required]
        public bool IsCredit { get; set; }

        /// <summary>
        /// The invoice-number of the invoice
        /// </summary>
        [Required]
        public int InvoiceNumber { get; set; }

        /// <summary>
        /// The name of the invoiced company 
        /// </summary>
        [Required]
        public string CompanyName { get; set; }

        /// <summary>
        /// Indicates which warehouse-department has created the invoice. Hong Kong / Fjugesta
        /// </summary>
        [Required]
        public string Warehouse { get; set; }

        /// <summary>
        /// The date of which the invoice was created
        /// </summary>
        public DateTime? InvoiceDate { get; set; }

        /// <summary>
        /// The date of which the invoice expires
        /// </summary>
        public DateTime? ExpiryDate { get; set; }

        /// <summary>
        /// The amount of the invoice
        /// </summary>
        [Required]
        public int Amount { get; set; }

    }
}
