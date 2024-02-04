// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WasaCommunity.Resources
{
    /// <summary>
    /// Represents a wrapper for page-header data
    /// </summary>
    public class PageHeader
    {
        /// <summary>
        /// The constructor of the page-header
        /// </summary>
        /// <param name="currentPage">Indicates which page is currently chosen</param>
        /// <param name="itemsPerPage">Indicates how many items are to be displayed per page</param>
        /// <param name="totalItems">Indicates the total amount of items</param>
        /// <param name="totalPages">Indicates the total amount of pages</param>
        public PageHeader(int currentPage, int itemsPerPage, int totalItems, int totalPages)
        {
            this.CurrentPage = currentPage;
            this.ItemsPerPage = itemsPerPage;
            this.TotalItems = totalItems;
            this.TotalPages = totalPages;
        }

        /// <summary>
        /// The current page
        /// </summary>
        public int CurrentPage { get; set; }

        /// <summary>
        /// Amount of items per page
        /// </summary>
        public int ItemsPerPage { get; set; }

        /// <summary>
        /// The total items of the page
        /// </summary>        
        public int TotalItems { get; set; }

        /// <summary>
        /// The total amount of pages
        /// </summary>        
        public int TotalPages { get; set; }
    }
}
