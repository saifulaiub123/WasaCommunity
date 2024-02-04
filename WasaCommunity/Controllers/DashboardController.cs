using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using System.Xml.Linq;
using AutoMapper;
using DAL;
using DAL.Core.Interfaces;
using DevExtreme.AspNet.Data;
using IdentityServer4.AccessTokenValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Logging;
using WasaCommunity.Helpers;
using WasaCommunity.Logging;
using WasaCommunity.Resources;

namespace WasaCommunity.Controllers
{
    /// <summary>
    /// The endpoint used for resources used within the dashboard
    /// </summary>
    [Authorize(AuthenticationSchemes = IdentityServerAuthenticationDefaults.AuthenticationScheme)]
    [Route("api/dashboard")]
    public class DashboardController : Controller
    {
        private IUnitOfWork _unitOfWork;
        private ILogger<DashboardController> _logger;
        private IAccountManager _accountManager;

        public DashboardController(IUnitOfWork unitOfWork, ILogger<DashboardController> logger,
                               IAccountManager accountManager)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _accountManager = accountManager;
        }


        /// <summary>
        /// Gets all the invoices
        /// </summary>
        /// <returns>A list of invoices</returns>
        [HttpGet("invoices")]
        [Produces(typeof(List<InvoiceResource>))]
        public IActionResult GetInvoices()
        {
            var invoices = _unitOfWork.Invoices.GetAll();
            if (invoices == null)
                return NotFound();

            return Ok(Mapper.Map<IEnumerable<InvoiceResource>>(invoices));
        }


        /// <summary>
        /// Gets a list of OrderstockResources containing the current orderstock data
        /// </summary>
        /// <returns>A list of OrderstockResources</returns>
        [HttpGet("orderstock")]
        [Produces(typeof(List<OrderstockResource>))]
        public IActionResult GetCurrentOrderstock()
        {
            var totalSumInSek = _unitOfWork.Orders.GetAll().Select(o => o.RemainingAmount).Sum();
            var amountOfOrders = _unitOfWork.Orders.GetAll().Select(o => o.Id).Count();

            var orderstockResources = new List<OrderstockResource>()
            {
                new OrderstockResource { TotalSumInSek = 0, AmountOfOrders = (amountOfOrders -100 ) },
                new OrderstockResource { TotalSumInSek = 0, AmountOfOrders = (amountOfOrders + 100) },
                new OrderstockResource { TotalSumInSek = totalSumInSek, AmountOfOrders = amountOfOrders },
            };

            return Ok(orderstockResources);
        }


        /// <summary>
        /// Gets a list of OrdersByPersonResource
        /// </summary>
        /// <returns>A list of OrdersByPersonResource</returns>
        [HttpGet("ordersbyperson")]
        [Produces(typeof(List<OrdersByPersonResource>))]
        public async Task<IActionResult> GetOrdersByPerson()
        {
            DateTime today = DateTime.Today;
            // Get all orders created within two weeks
            var orders = _unitOfWork.Orders.GetAll().Where(o => o.RegistrationDate > today.AddDays(-14));
            // Get salespersons for those orders
            var salesPersonsLastTwoWeeks = orders.Select(o => o.SalesPerson).Distinct();

            // Get orders created today
            var todaysOrders = _unitOfWork.Orders.GetAll().Where(o => o.RegistrationDate == today);
            var salesPersons = todaysOrders.Select(o => o.SalesPerson).Distinct();

            var ordersByPersonResources = new List<OrdersByPersonResource>();

            foreach (var salesPerson in salesPersons)
            {
                if (!string.IsNullOrEmpty(salesPerson))
                {
                    var email = todaysOrders.FirstOrDefault(o => o.SalesPerson == salesPerson).Email;
                    var user = await _accountManager.GetUserByEmailAsync(email);

                    var ordersByPersonResource = new OrdersByPersonResource
                    {
                        SalesPerson = salesPerson,
                        User = Mapper.Map<MinimalUserResource>(user),
                        TotalSumInSek = todaysOrders.Where(o => o.SalesPerson == salesPerson).Select(o => o.RemainingAmount).Sum(),
                        AmountOfOrders = todaysOrders.Where(o => o.SalesPerson == salesPerson).Select(o => o.Id).Count(),
                        Orders = Mapper.Map<IEnumerable<OrderResource>>(todaysOrders.Where(o => o.SalesPerson == salesPerson))
                    };
                    if (ordersByPersonResource.AmountOfOrders > 0)
                    {
                        ordersByPersonResources.Add(ordersByPersonResource);
                    }
                }
            }

            return Ok(ordersByPersonResources.GroupBy(o => o.SalesPerson).Select(o => o.Last()));
        }
    }
}