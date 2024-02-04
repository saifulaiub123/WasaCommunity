using DAL.Models;
using Serilog;
using Serilog.Events;
using Serilog.Sinks.MSSqlServer;
using System;
using System.Collections.ObjectModel;
using System.Data;
using System.Data.SqlClient;
using System.IO;
using System.Reflection;
using WasaCommunity.Helpers;

namespace WasaCommunity.Logging
{
    public static class Logger
    {
        private static readonly ILogger _perfLogger;
        private static readonly ILogger _usageLogger;
        private static readonly ILogger _backendErrorLogger;
        private static readonly ILogger _frontendErrorLogger;
        private static readonly ILogger _diagnosticLogger;

        static Logger()
        {
            // TODO: Fetch connectionString from appsettings
            // var connectionString = "Server=DESKTOP-RBKDG0O\\SQLSERVER2017;Database=WasaCommunitySQLData;Trusted_Connection=True;";
            var connectionString = ConfigHelper.ConnectionString("ConnectionStrings", "SqlServerConnection");
            _perfLogger = new LoggerConfiguration()
                .WriteTo.MSSqlServer(connectionString, "PerformanceLogs", autoCreateSqlTable: true,
                    columnOptions: GetSqlColumnOptions(true), batchPostingLimit: 1)
                .CreateLogger();

            _usageLogger = new LoggerConfiguration()
                .WriteTo.MSSqlServer(connectionString, "UsageLogs", autoCreateSqlTable: true,
                    columnOptions: GetSqlColumnOptions(), batchPostingLimit: 1)
                .CreateLogger();

            _backendErrorLogger = new LoggerConfiguration()
                .WriteTo.MSSqlServer(connectionString, "BackendErrorLogs", autoCreateSqlTable: true,
                    columnOptions: GetSqlColumnOptions(false, true), batchPostingLimit: 1)
                .CreateLogger();

            _frontendErrorLogger = new LoggerConfiguration()
                .WriteTo.MSSqlServer(connectionString, "FrontendErrorLogs", autoCreateSqlTable: true,
                    columnOptions: GetSqlColumnOptions(false, false, true), batchPostingLimit: 1)
                .CreateLogger();

            _diagnosticLogger = new LoggerConfiguration()
                .WriteTo.MSSqlServer(connectionString, "DiagnosticLogs", autoCreateSqlTable: true,
                    columnOptions: GetSqlColumnOptions(), batchPostingLimit: 1)
                .CreateLogger();
        }


        public static ColumnOptions GetSqlColumnOptions(bool includePerformanceColumns = false,
                                                        bool includeBackendErrorColumns = false,
                                                        bool includeFrontendErrorColumns = false)
        {
            ColumnOptions colOptions = RemoveSqlColumns();
            AddBaseLogColumns(colOptions);

            if (includePerformanceColumns)
                colOptions.AdditionalDataColumns.Add(new DataColumn { DataType = typeof(int), ColumnName = "ElapsedMilliseconds" });

            if (includeBackendErrorColumns)
            {
                // colOptions.AdditionalDataColumns.Add(new DataColumn { DataType = typeof(string), ColumnName = "CorrelationId" });
                // colOptions.AdditionalDataColumns.Add(new DataColumn { DataType = typeof(string), ColumnName = "Exception" });
                colOptions.AdditionalDataColumns.Add(new DataColumn { DataType = typeof(string), ColumnName = "CustomException" });
            }

            if (includeFrontendErrorColumns)
            {
                colOptions.AdditionalDataColumns.Add(new DataColumn { DataType = typeof(string), ColumnName = "OriginalMessage" });
                // colOptions.AdditionalDataColumns.Add(new DataColumn { DataType = typeof(string), ColumnName = "AdditionalErrorInfo" });
            }

            return colOptions;
        }

        private static void AddBaseLogColumns(ColumnOptions colOptions)
        {
            colOptions.AdditionalDataColumns = new Collection<DataColumn>
            {
                new DataColumn {DataType = typeof(DateTime), ColumnName = "Timestamp"},
                new DataColumn {DataType = typeof(string), ColumnName = "Layer"},
                new DataColumn {DataType = typeof(string), ColumnName = "Location"},
                new DataColumn {DataType = typeof(string), ColumnName = "Message"},
                new DataColumn {DataType = typeof(string), ColumnName = "UserId"},
                new DataColumn {DataType = typeof(string), ColumnName = "UserName"},
                new DataColumn {DataType = typeof(string), ColumnName = "HostName"},
                // new DataColumn {DataType = typeof(string), ColumnName = "AdditionalInfo"},
            };
        }

        private static ColumnOptions RemoveSqlColumns()
        {
            var colOptions = new ColumnOptions();
            colOptions.Store.Remove(StandardColumn.Properties);
            colOptions.Store.Remove(StandardColumn.MessageTemplate);
            colOptions.Store.Remove(StandardColumn.Message);
            colOptions.Store.Remove(StandardColumn.Exception);
            colOptions.Store.Remove(StandardColumn.TimeStamp);
            colOptions.Store.Remove(StandardColumn.Level);
            return colOptions;
        }

        public static void WritePerformance(PerformanceLog log)
        {
            _perfLogger.Write(LogEventLevel.Information,
                "{Id}{Timestamp}{Message}{Layer}{Location}{ElapsedMilliseconds}{HostName}" +
                "{UserId}{UserName}",
                log.Id, log.Timestamp, log.Message, log.Layer, log.Location, log.ElapsedMilliseconds,
                log.HostName, log.UserId, log.UserName
            );
        }
        public static void WriteUsage(UsageLog log)
        {
            _usageLogger.Write(LogEventLevel.Information,
                "{Id}{Timestamp}{Message}{Layer}{Location}{HostName}{UserId}{UserName}",
                log.Id, log.Timestamp, log.Message, log.Layer, log.Location, log.HostName,
                log.UserId, log.UserName
            );
        }
        public static void WriteBackendError(BackendErrorLog log)
        {
            if (log.Exception != null)
            {
                var procName = FindProcName(log.Exception);
                log.Location = string.IsNullOrEmpty(procName)
                    ? log.Location
                    : procName;
                log.Message = GetMessageFromException(log.Exception);
            }

            _backendErrorLogger.Write(LogEventLevel.Information,
                "{Id}{Timestamp}{Message}{Layer}{Location}{CustomException}{HostName}" +
                "{UserId}{UserName}",
                log.Id, log.Timestamp, log.Message, log.Layer, log.Location,
                log.Exception?.ToBetterString(), log.HostName, log.UserId,
                log.UserName
            );
        }

        public static void WriteFrontendError(FrontendErrorLog log)
        {
            _frontendErrorLogger.Write(LogEventLevel.Information,
                "{Id}{Timestamp}{Layer}{Message}{Location}{UserId}{UserName}{HostName}{OriginalMessage}",
                log.Id, log.Timestamp, log.Layer, log.Message, log.Location, log.UserId, log.UserName,
                log.HostName, log.OriginalMessage
            );
        }

        public static void WriteDiagnostic(DiagnosticLog log)
        {
            // var writeDiagnostics = 
            //     Convert.ToBoolean(Environment.GetEnvironmentVariable("DIAGNOSTICS_ON"));
            // if (!writeDiagnostics)
            //     return;

            _diagnosticLogger.Write(LogEventLevel.Information,
                "{Id}{Timestamp}{Message}{Layer}{Location}{HostName}{UserId}{UserName}",
                log.Id, log.Timestamp, log.Message, log.Layer, log.Location, log.HostName,
                log.UserId, log.UserName
            );
        }

        private static string GetMessageFromException(Exception ex)
        {
            if (ex.InnerException != null)
                return GetMessageFromException(ex.InnerException);

            return ex.Message;
        }

        private static string FindProcName(Exception ex)
        {
            var sqlEx = ex as SqlException;
            if (sqlEx != null)
            {
                var procName = sqlEx.Procedure;
                if (!string.IsNullOrEmpty(procName))
                    return procName;
            }

            if (!string.IsNullOrEmpty((string)ex.Data["Procedure"]))
            {
                return (string)ex.Data["Procedure"];
            }

            if (ex.InnerException != null)
                return FindProcName(ex.InnerException);

            return null;
        }
    }
}