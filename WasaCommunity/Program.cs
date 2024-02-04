// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using WasaCommunity.Helpers;
using DAL;
using Serilog.Events;
using Serilog.Sinks.MSSqlServer;
using Serilog;

namespace WasaCommunity
{
       public class Program
    {
        public static void Main(string[] args)
        {
            try
            {
                AppContext.SetSwitch("System.Net.Http.UseSocketsHttpHandler", false);
                var host = CreateWebHostBuilder(args).Build();
                Log.Logger = new LoggerConfiguration()
                    .Enrich.FromLogContext()
                    .WriteTo.File("C:\\mylogs\\log.txt", rollingInterval: RollingInterval.Day)
                    .CreateLogger();

                Log.Information("Application starting....");

                using (var scope = host.Services.CreateScope())
                {
                    var services = scope.ServiceProvider;
                    try
                    {
                        //var databaseInitializer = services.GetRequiredService<IDatabaseInitializer>();
                        //databaseInitializer.SeedAsync().Wait();
                    }
                    catch (Exception ex)
                    {
                        Log.Fatal(ex, "Host terminated unexpectedly");
                        var logger = services.GetRequiredService<ILogger<Program>>();
                        logger.LogCritical(LoggingEvents.INIT_DATABASE, ex, LoggingEvents.INIT_DATABASE.Name);
                    }
                }
                host.Run();
            }
            catch (Exception e)
            {

                Log.Fatal(e, "Host terminated unexpectedly");
            }
        }


        public static IWebHostBuilder CreateWebHostBuilder(string[] args) =>
           WebHost.CreateDefaultBuilder(args)
               .UseStartup<Startup>();
    }
}
