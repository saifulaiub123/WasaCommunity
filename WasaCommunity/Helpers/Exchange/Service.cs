using System;
using System.Net;
using Microsoft.Exchange.WebServices.Data;

namespace WasaCommunity.Helpers.Exchange
{
    public static class Service
    {
        static Service()
        {
            CertificateCallback.Initialize();
        }

        // The following is a basic redirection validation callback method. It 
        // inspects the redirection URL and only allows the Service object to 
        // follow the redirection link if the URL is using HTTPS. 
        //
        // This redirection URL validation callback provides sufficient security
        // for development and testing of your application. However, it may not
        // provide sufficient security for your deployed application. You should
        // always make sure that the URL validation callback method that you use
        // meets the security requirements of your organization.
        private static bool RedirectionUrlValidationCallback(string redirectionUrl)
        {
            // The default for the validation callback is to reject the URL.
            bool result = false;

            Uri redirectionUri = new Uri(redirectionUrl);

            // Validate the contents of the redirection URL. In this simple validation
            // callback, the redirection URL is considered valid if it is using HTTPS
            // to encrypt the authentication credentials. 
            if (redirectionUri.Scheme == "https")
            {
                result = true;
            }

            return result;
        }

        public static ExchangeService ConnectToService(string email = "dashboard@wasasweden.se", string password = "MDuYbzYdu")
        {
            ExchangeService service = new ExchangeService(ExchangeVersion.Exchange2013);
            service.Credentials = new NetworkCredential(email, password);
            service.Url = new Uri("https://owa.netropolis.se/ews/exchange.asmx");

            return service;
        }

        public static ExchangeService ConnectToServiceWithImpersonation(
          string email,
          string password,
          string impersonatedEmail)
        {
            ExchangeService service = new ExchangeService(ExchangeVersion.Exchange2013);

            service.Credentials = new NetworkCredential(email, password);

            ImpersonatedUserId impersonatedUserId =
              new ImpersonatedUserId(ConnectingIdType.SmtpAddress, impersonatedEmail);

            service.ImpersonatedUserId = impersonatedUserId;

            service.AutodiscoverUrl(email, RedirectionUrlValidationCallback);

            return service;
        }
    }
}
