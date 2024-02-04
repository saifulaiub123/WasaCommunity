using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Xml.Linq;
using DAL;
using DAL.Models;
using Microsoft.Extensions.Logging;

namespace WasaCommunity.Services
{
    public interface IDataVisualization
    {
        void FetchAndUpdateInvoices();
        void FetchAndUpdateOrders();
    }

    public class DataVisualization : IDataVisualization
    {
        private ILogger<DataVisualization> _logger;
        private IUnitOfWork _unitOfWork;

        public DataVisualization(ILogger<DataVisualization> logger, IUnitOfWork unitOfWork)
        {
            _logger = logger;
            _unitOfWork = unitOfWork;
        }


        public void FetchAndUpdateInvoices()
        {

            IEnumerable<Invoice> invoices = null;

            _logger.LogInformation("Fetching invoices from XML...");

            try {
                XElement xelement = XElement.Load(@"http://shop.wasasweden.se/dashboard/invoices.xml");
                // XElement xelement = XElement.Load(@"wwwroot/invoices-warehouse.xml");
                invoices = from row in xelement.Elements("rows").Elements()
                            select new Invoice
                            {
                                Id = Guid.NewGuid().ToString(),
                                IsCredit = isCreditInvoice((string)row.Element("col1")),
                                InvoiceNumber = parseToInt((string)row.Element("col2")),
                                CompanyName = (string)row.Element("col4"),
                                Warehouse = retrieveWarehouse((string)row.Element("col6")),
                                InvoiceDate = parseToDate((string)row.Element("col7")),
                                ExpiryDate = parseToDate((string)row.Element("col8")),
                                Amount = (int)Math.Round(parseToDouble((string)row.Element("col9")), MidpointRounding.AwayFromZero),
                            };
            }
            catch(Exception ex) {
                _logger.LogInformation(ex.Message);
            }
            
            if (invoices == null)
                return;
                
            var invoicesFromDatabase = _unitOfWork.Invoices.GetAll();

            _logger.LogInformation("Removing " + invoicesFromDatabase.Count() + " invoices from database...");
            _unitOfWork.Invoices.RemoveRange(invoicesFromDatabase);

            _logger.LogInformation("Adding " + invoices.Count() + " invoices to database...");
            
            try {
                _unitOfWork.Invoices.AddRange(invoices);
                _unitOfWork.SaveChanges();
                _logger.LogInformation("Invoices was successfully written to database...");
            }
            catch(Exception ex) {
                _logger.LogCritical(ex.Message);
            }            
            
        }

        public void FetchAndUpdateOrders()
        {
            IEnumerable<Order> orders = null;

            _logger.LogInformation("Fetching orders from XML...");

            try {
                XElement xelement = XElement.Load(@"http://shop.wasasweden.se/dashboard/active-orders.xml");
                // XElement xelement = XElement.Load(@"wwwroot/invoices-warehouse.xml");
                orders = from row in xelement.Elements("rows").Elements()
                            select new Order
                            {
                                Id = Guid.NewGuid().ToString(),
                                OrderNumber = parseToInt((string)row.Element("col1")),
                                CustomerNumber = parseToInt((string)row.Element("col2")),
                                CustomerName = (string)row.Element("col3"),
                                SalesPerson = (string)row.Element("col6"),
                                RegistrationDate = parseToDate((string)row.Element("col7")),
                                OrderAmount = (int)Math.Round(parseToDouble((string)row.Element("col9")), MidpointRounding.AwayFromZero),
                                InvoicedDate = parseToDate((string)row.Element("col10")),
                                InvoicedAmount = (int)Math.Round(parseToDouble((string)row.Element("col12")), MidpointRounding.AwayFromZero),
                                RemainingAmount = (int)Math.Round(parseToDouble((string)row.Element("col13")), MidpointRounding.AwayFromZero),
                                Email = (string)row.Element("col17")
                            };
            }
            catch(Exception ex) {
                _logger.LogInformation(ex.Message);
            }
            
            if (orders == null)
                return;
                
            var ordersFromDatabase = _unitOfWork.Orders.GetAll();

            _logger.LogInformation("Removing " + ordersFromDatabase.Count() + " orders from database...");
            _unitOfWork.Orders.RemoveRange(ordersFromDatabase);

            _logger.LogInformation("Adding " + orders.Count() + " orders to database...");
            
            try {
                _unitOfWork.Orders.AddRange(orders);
                _unitOfWork.SaveChanges();
                _logger.LogInformation("Orders was successfully written to database...");
            }
            catch(Exception ex) {
                _logger.LogCritical(ex.Message);
            }            
        }

        private string retrieveWarehouse(string stringToConvert) 
        {
            string warehouse = "";
            int convertedInt = -1;

            if (!string.IsNullOrEmpty(stringToConvert))
            {
                var modifiedString = stringToConvert.Trim();
                int.TryParse(modifiedString, out convertedInt);
            }

            if (convertedInt == 10)
                warehouse = "Fjugesta";

            else if (convertedInt == 20) {
                warehouse = "Hong Kong";
            }

            return warehouse;
        }

        private int parseToInt(string stringToConvert)
        {
            int convertedInt = 0;
            if (!string.IsNullOrEmpty(stringToConvert))
            {
                var modifiedString = stringToConvert.Trim();
                int.TryParse(modifiedString, out convertedInt);
            }
            return convertedInt;
        }

        private double parseToDouble(string stringToConvert)
        {
            double convertedDouble = 0;
            if (!string.IsNullOrEmpty(stringToConvert))
            {
                var modifiedString = stringToConvert.Trim().Replace(".", ",");
                double.TryParse(modifiedString, out convertedDouble);
            }
            return convertedDouble;
        }

        private bool isCreditInvoice(string invoiceType)
        {
            bool isCreditInvoice = false;
            if (!string.IsNullOrEmpty(invoiceType))
            {
                if (invoiceType == "K")
                    isCreditInvoice = true;

            }
            return isCreditInvoice;
        }

        private DateTime? parseToDate(string dateToParse) 
        {
            DateTime? parsedDate = null;

            if (!string.IsNullOrEmpty(dateToParse)) {
                parsedDate = DateTime.ParseExact(dateToParse, "yyMMdd", CultureInfo.InvariantCulture);
            }
   
            return parsedDate;
        }
    }
}