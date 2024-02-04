using DAL.Models;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Security.Claims;

namespace WasaCommunity.Logging
{
    public static class WebHelper
    {
        public static void LogWebUsage(string layer, string activityName, HttpContext context,
                                       Dictionary<string, object> additionalInfo = null)
        {
            var usageLog = CreateUsageLog(activityName, context, layer, additionalInfo);
            Logger.WriteUsage(usageLog);
        }

        public static void LogWebDiagnostic(string message, HttpContext context, string layer,
                                            Dictionary<string, object> diagnosticInfo = null)
        {

            var diagnosticLog = CreateDiagnosticLog(message, context, layer, diagnosticInfo);
            Logger.WriteDiagnostic(diagnosticLog);
        }
        public static void LogWebError(string layer, Exception ex,
            HttpContext context)
        {
            var errorLog = CreateErrorLog(null, context, layer, null);
            errorLog.Exception = ex;

            Logger.WriteBackendError(errorLog);
        }

        public static UsageLog CreateUsageLog(string activityName, HttpContext context, string layer,
                                           Dictionary<string, object> additionalInfo = null)
        {
            var usageLog = new UsageLog
            {
                Layer = layer,
                Message = activityName,
                HostName = Environment.MachineName,
                // CorrelationId = Activity.Current?.Id ?? context.TraceIdentifier,
                // AdditionalInfo = additionalInfo ?? new Dictionary<string, object>()
            };

            GetUserData(usageLog, context);
            GetRequestData(usageLog, context);
            return usageLog;
        }

        public static PerformanceLog CreatePerformanceLog(string activityName, HttpContext context, string layer,
                                   Dictionary<string, object> additionalInfo = null)
        {
            var performanceLog = new PerformanceLog
            {
                Layer = layer,
                Message = activityName,
                HostName = Environment.MachineName,
                // CorrelationId = Activity.Current?.Id ?? context.TraceIdentifier,
                // AdditionalInfo = additionalInfo ?? new Dictionary<string, object>()
            };

            GetUserData(performanceLog, context);
            GetRequestData(performanceLog, context);
            return performanceLog;
        }

        public static BackendErrorLog CreateErrorLog(string activityName, HttpContext context, string layer,
                           Dictionary<string, object> additionalInfo = null)
        {
            var errorLog = new BackendErrorLog
            {
                Layer = layer,
                Message = activityName,
                HostName = Environment.MachineName,
                // CorrelationId = Activity.Current?.Id ?? context.TraceIdentifier,
                // AdditionalInfo = additionalInfo ?? new Dictionary<string, object>()
            };

            GetUserData(errorLog, context);
            GetRequestData(errorLog, context);
            return errorLog;
        }

        public static DiagnosticLog CreateDiagnosticLog(string activityName, HttpContext context, string layer,
                   Dictionary<string, object> additionalInfo = null)
        {
            var diagnosticLog = new DiagnosticLog
            {
                Layer = layer,
                Message = activityName,
                HostName = Environment.MachineName,
                // CorrelationId = Activity.Current?.Id ?? context.TraceIdentifier,
                // AdditionalInfo = additionalInfo ?? new Dictionary<string, object>()
            };

            GetUserData(diagnosticLog, context);
            GetRequestData(diagnosticLog, context);
            return diagnosticLog;
        }

        private static void GetRequestData(BaseLog log, HttpContext context)
        {
            var request = context.Request;
            if (request != null)
            {
                log.Location = request.Path;
                // log.AdditionalInfo.Add("Languages", request.Headers["Accept-Language"]);

                // var qdict = Microsoft.AspNetCore.WebUtilities
                //     .QueryHelpers.ParseQuery(request.QueryString.ToString());
                // foreach (var key in qdict.Keys)
                // {
                //     log.AdditionalInfo.Add($"QueryString-{key}", qdict[key]);
                // }

            }
        }

        private static void GetUserData(BaseLog log, HttpContext context)
        {
            var userId = "";
            var userName = "";
            var user = context.User;  // ClaimsPrincipal.Current is not sufficient
            if (user != null)
            {
                // var i = 1; // i included in dictionary key to ensure uniqueness
                foreach (var claim in user.Claims)
                {
                    if (claim.Type == ClaimTypes.NameIdentifier)
                        userId = claim.Value;
                    else if (claim.Type == "name")
                        userName = claim.Value;
                    // else
                    //     // example dictionary key: UserClaim-4-role 
                    //     log.AdditionalInfo.Add($"UserClaim-{i++}-{claim.Type}", claim.Value);
                }
            }
            log.UserId = userId;
            log.UserName = userName;
        }
    }
}
