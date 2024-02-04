using System.Collections.Generic;
using System.Linq;
using DAL;
using DAL.Core.Interfaces;
using DAL.Models;
using IdentityServer4.AccessTokenValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WasaCommunity.Logging;
using WasaCommunity.Resources;


namespace WasaCommunity.Controllers
{
    /// <summary>
    /// The endpoint used for logging
    /// </summary>
    [Authorize(AuthenticationSchemes = IdentityServerAuthenticationDefaults.AuthenticationScheme)]
    [Route("/api/logging")]
    public class LoggingController : Controller
    {
        private IUnitOfWork _unitOfWork;
        private IAccountManager _accountManager;

        public LoggingController(IUnitOfWork unitOfWork, IAccountManager accountManager)
        {
            _unitOfWork = unitOfWork;
            _accountManager = accountManager;
        }
        /// <summary>
        /// Writes a diagnostic log
        /// </summary>
        /// <param name="diagnosticLog">The resource containing the log details</param>
        [HttpPost]
        [Route("diagnostic")]
        public void WriteDiagnostic([FromBody] DiagnosticLog diagnosticLog)
        {
            Logger.WriteDiagnostic(diagnosticLog);
        }

        /// <summary>
        /// Writes an error log
        /// </summary>
        /// <param name="errorLog">The resource containing the log details</param>
        [HttpPost]
        [Route("error")]
        [AllowAnonymous]
        public void WriteError([FromBody] FrontendErrorLog errorLog)
        {
            Logger.WriteFrontendError(errorLog);
        }

        /// <summary>
        /// Writes a performance log
        /// </summary>
        /// <param name="performanceLog">The resource containing the log details</param>
        [HttpPost]
        [Route("performance")]
        public void WritePerformance([FromBody] PerformanceLog performanceLog)
        {
            Logger.WritePerformance(performanceLog);
        }

        /// <summary>
        /// Writes a usage log
        /// </summary>
        /// <param name="usageLog">The resource containing the log details</param>
        [HttpPost]
        [Route("usage")]
        public void WriteUsage([FromBody] UsageLog usageLog)
        {
            Logger.WriteUsage(usageLog);
        }

        /// <summary>
        /// Gets the most active users
        /// </summary>
        /// <param name="page">Defines which page should be returned</param>
        /// <param name="pageSize">Defines how many active users should be returned</param>
        [HttpGet("usage/mostactiveusers/{page:int}/{pageSize:int}")]
        [Authorize(Authorization.Policies.ViewApplicationInsightsPolicy)]
        public IActionResult GetMostActiveUsers(int page, int pageSize)
        {
            var usageLogs = _unitOfWork.UsageLogs.GetAll().Where(x => x.UserName != null && x.UserName != string.Empty);
            List<MostActiveUsersResource> resource = new List<MostActiveUsersResource>();

            foreach (var log in usageLogs)
            {
                var mostActiveUsersResource = new MostActiveUsersResource
                {
                    UserName = log.UserName,
                    AmountOfUsageLogsGenerated = usageLogs.Where(x => x.UserName == log.UserName).Count()
                };
                resource.Add(mostActiveUsersResource);
            }

            resource = resource.GroupBy(x => x.UserName).Select(x => x.FirstOrDefault()).ToList();
            resource = resource.OrderByDescending(x => x.AmountOfUsageLogsGenerated).ToList();   
            resource = resource.Skip((page - 1) * pageSize).Take(pageSize).ToList(); 


            return Ok(resource);
        }

        /// <summary>
        /// Gets performance logs with average elapsed milliseconds by api location
        /// </summary>
        /// <param name="page">Defines which page should be returned</param>
        /// <param name="pageSize">Defines how many entries should be returned</param>
        [HttpGet("performance/average/{page:int}/{pageSize:int}")]
        [Authorize(Authorization.Policies.ViewApplicationInsightsPolicy)]
        public IActionResult GetAveragePerformance(int page, int pageSize)
        {
            var performanceLogs = _unitOfWork.PerformanceLogs.GetAll();
            List<AveragePerformanceResource> resource = new List<AveragePerformanceResource>();

            foreach (var log in performanceLogs)
            {
                var averagePerformanceResource = new AveragePerformanceResource
                {
                    Message = log.Message,
                    AverageMilliseconds = performanceLogs.Where(x => x.Message == log.Message).Average(x => x.ElapsedMilliseconds),
                    PerformanceLogs = performanceLogs.Where(x => x.Message == log.Message)
                };

                resource.Add(averagePerformanceResource);
            }

            resource = resource.GroupBy(x => x.Message).Select(x => x.FirstOrDefault()).ToList();
            resource = resource.OrderByDescending(x => x.AverageMilliseconds).ToList();
            resource = resource.Skip((page - 1) * pageSize).Take(pageSize).ToList();


            return Ok(resource);
        }


        /// <summary>
        /// Gets frontend error logs by api location
        /// </summary>
        /// <param name="page">Defines which page should be returned</param>
        /// <param name="pageSize">Defines how many entries should be returned</param>
        [HttpGet("error/frontend/errorsbylocation/{page:int}/{pageSize:int}")]
        [Authorize(Authorization.Policies.ViewApplicationInsightsPolicy)]
        public IActionResult GetFrontendErrorsByLocation(int page, int pageSize)
        {
            var errorLogs = _unitOfWork.FrontendErrorLogs.GetAll();
            List<FrontendErrorsByLocationResource> resource = new List<FrontendErrorsByLocationResource>();

            foreach (var log in errorLogs)
            {
                var frontendErrorsByLocationResource = 
                    new FrontendErrorsByLocationResource
                    {
                        Location = log.Location,
                        AmountOfErrors = errorLogs.Where(x => x.Location == log.Location).Count(),
                        AmountOfUsersAffected = errorLogs.Where(x => (x.Location == log.Location) && (x.UserName != null && x.UserName != string.Empty)).GroupBy(x => x.UserName).Select(x => x.FirstOrDefault()).Count(),
                        Errors = errorLogs.Where(x => x.Location == log.Location)
                    };
                resource.Add(frontendErrorsByLocationResource); 
            }

            resource = resource.GroupBy(x => x.Location).Select(x => x.FirstOrDefault()).ToList();
            resource = resource.OrderByDescending(x => x.AmountOfErrors).ToList();
            resource = resource.Skip((page - 1) * pageSize).Take(pageSize).ToList();

            return Ok(resource);
        }


        /// <summary>
        /// Gets backend error logs by api location
        /// </summary>
        /// <param name="page">Defines which page should be returned</param>
        /// <param name="pageSize">Defines how many entries should be returned</param>
        [HttpGet("error/backend/errorsbylocation/{page:int}/{pageSize:int}")]
        [Authorize(Authorization.Policies.ViewApplicationInsightsPolicy)]
        public IActionResult GetBackendErrorsByLocation(int page, int pageSize)
        {
            var errorLogs = _unitOfWork.BackendErrorLogs.GetAll();
            List<BackendErrorsByLocationResource> resource = new List<BackendErrorsByLocationResource>();

            foreach (var log in errorLogs)
            {
                var backendErrorsByLocationResource = 
                    new BackendErrorsByLocationResource
                    {
                        Location = log.Location,
                        AmountOfErrors = errorLogs.Where(x => x.Location == log.Location).Count(),
                        AmountOfUsersAffected = errorLogs.Where(x => (x.Location == log.Location) && (x.UserName != null && x.UserName != string.Empty)).GroupBy(x => x.UserName).Select(x => x.FirstOrDefault()).Count(),
                        Errors = errorLogs.Where(x => x.Location == log.Location)
                    };
                resource.Add(backendErrorsByLocationResource); 
            }

            resource = resource.GroupBy(x => x.Location).Select(x => x.FirstOrDefault()).ToList();
            resource = resource.OrderByDescending(x => x.AmountOfErrors).ToList();
            resource = resource.Skip((page - 1) * pageSize).Take(pageSize).ToList();

            return Ok(resource);
        }


        /// <summary>
        /// Gets most used features based on amount of log-entries
        /// </summary>
        /// <param name="page">Defines which page should be returned</param>
        /// <param name="pageSize">Defines how many entries should be returned</param>
        [HttpGet("usage/mostused/{page:int}/{pageSize:int}")]
        [Authorize(Authorization.Policies.ViewApplicationInsightsPolicy)]
        public IActionResult GetMostUsedFeatures(int page, int pageSize)
        {
            var usageLogs = _unitOfWork.UsageLogs.GetAll();
            List<MostUsedFeaturesResource> resource = new List<MostUsedFeaturesResource>();

            foreach (var log in usageLogs)
            {
                var mostUsedFeaturesResource = new MostUsedFeaturesResource
                {
                    Location = log.Location,
                    AmountOfUsageLogsGenerated = usageLogs.Where(x => x.Location == log.Location).Count()
                };
                resource.Add(mostUsedFeaturesResource);
            }

            resource = resource.GroupBy(x => x.Location).Select(x => x.FirstOrDefault()).ToList();
            resource = resource.OrderByDescending(x => x.AmountOfUsageLogsGenerated).ToList();
            resource = resource.Skip((page - 1) * pageSize).Take(pageSize).ToList(); 
   

            return Ok(resource);
        }

    }
}