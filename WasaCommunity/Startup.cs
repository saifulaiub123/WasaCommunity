// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

using AutoMapper;
using DAL;
using DAL.Core;
using DAL.Core.Interfaces;
using DAL.Models;
using IdentityServer4.AccessTokenValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SpaServices.AngularCli;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using WasaCommunity.Authorization;
using WasaCommunity.Helpers;
using Swashbuckle.AspNetCore.Swagger;
using System;
using System.Collections.Generic;
using System.Reflection;
using AppPermissions = DAL.Core.ApplicationPermissions;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using WasaCommunity.Services;
using Hangfire;
using System.Text;
using WasaCommunity.Hubs;
using WasaCommunity.Mappings;
using System.IO;
using System.Diagnostics;
using WasaCommunity.Logging;
using IdentityModel.AspNetCore.OAuth2Introspection;

namespace WasaCommunity
{
    public class Startup
    {
        public IConfiguration Configuration { get; }
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly ILoggerFactory _loggerFactory;


        public Startup(IConfiguration configuration, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            Configuration = configuration;
            _hostingEnvironment = env;
            _loggerFactory = loggerFactory;
        }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            string connectionString = Configuration["ConnectionStrings:SQLServerOAuthConnection"];
            string migrationsAssembly = typeof(Startup).GetTypeInfo().Assembly.GetName().Name;

            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlServer(Configuration["ConnectionStrings:SQLServerConnection"], b => b.MigrationsAssembly("WasaCommunity").EnableRetryOnFailure()).EnableSensitiveDataLogging());


            // Add identity
            services.AddIdentity<User, Role>()
                .AddEntityFrameworkStores<ApplicationDbContext>()
                .AddDefaultTokenProviders();

            // Configure Identity options and password complexity here
            services.Configure<IdentityOptions>(options =>
            {
                // User settings
                options.User.RequireUniqueEmail = true;

                   // Password settings
                   options.Password.RequireDigit = false;
                   options.Password.RequiredLength = 8;
                   options.Password.RequireNonAlphanumeric = false;
                   options.Password.RequireUppercase = false;
                   options.Password.RequireLowercase = false;

                //    //// Lockout settings
                //    //options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(30);
                //    //options.Lockout.MaxFailedAccessAttempts = 10;
            });


            // Adds IdentityServer.
            services.AddIdentityServer()
                .AddSigninCredentialFromConfig(Configuration.GetSection("SigninKeyCredentials"), _loggerFactory.CreateLogger("SignInKeyCredentials"))
                .AddConfigurationStore(options =>
                {
                    options.ConfigureDbContext = builder => builder.UseSqlServer(connectionString, sql => sql.MigrationsAssembly(migrationsAssembly));
                })
                .AddOperationalStore(options =>
                {
                    options.ConfigureDbContext = builder => builder.UseSqlServer(connectionString, sql => sql.MigrationsAssembly(migrationsAssembly));

                    // this enables automatic token cleanup. this is optional. 
                    //options.EnableTokenCleanup = true;
                    //options.TokenCleanupInterval = 30;
                })
                .AddAspNetIdentity<User>()
                .AddProfileService<ProfileService>();


            var applicationUrl = Configuration["ApplicationUrl"].TrimEnd('/');

            services.AddAuthentication(IdentityServerAuthenticationDefaults.AuthenticationScheme)
                .AddIdentityServerAuthentication(options =>
                {
                    options.Authority = applicationUrl;
                    options.SupportedTokens = SupportedTokens.Jwt;
                    options.RequireHttpsMetadata = false; // Note: Set to true in production
                    options.ApiName = IdentityServerConfig.ApiName;
                    options.TokenRetriever = new Func<HttpRequest, string>(req =>
                    {
                        var fromHeader = TokenRetrieval.FromAuthorizationHeader();
                        var fromQuery = TokenRetrieval.FromQueryString();
                        return fromHeader(req) ?? fromQuery(req);
                    });
                });


            services.AddAuthorization(options =>
            {
                options.AddPolicy(Authorization.Policies.ViewAllUsersPolicy, policy => policy.RequireClaim(ClaimConstants.Permission, AppPermissions.ViewUsers));
                options.AddPolicy(Authorization.Policies.ManageAllUsersPolicy, policy => policy.RequireClaim(ClaimConstants.Permission, AppPermissions.ManageUsers));

                options.AddPolicy(Authorization.Policies.ViewAllRolesPolicy, policy => policy.RequireClaim(ClaimConstants.Permission, AppPermissions.ViewRoles));
                options.AddPolicy(Authorization.Policies.ViewRoleByRoleNamePolicy, policy => policy.Requirements.Add(new ViewRoleAuthorizationRequirement()));
                options.AddPolicy(Authorization.Policies.ManageAllRolesPolicy, policy => policy.RequireClaim(ClaimConstants.Permission, AppPermissions.ManageRoles));

                options.AddPolicy(Authorization.Policies.AssignAllowedRolesPolicy, policy => policy.Requirements.Add(new AssignRolesAuthorizationRequirement()));

                options.AddPolicy(Authorization.Policies.ViewAllGroupsPolicy, policy => policy.RequireClaim(ClaimConstants.Permission, AppPermissions.ViewGroups));
                options.AddPolicy(Authorization.Policies.ManageAllGroupsPolicy, policy => policy.RequireClaim(ClaimConstants.Permission, AppPermissions.ManageGroups));

                options.AddPolicy(Authorization.Policies.ViewApplicationInsightsPolicy, policy => policy.RequireClaim(ClaimConstants.Permission, AppPermissions.ViewApplicationInsights));
            });


            // Add cors
            services.AddCors();

            services.AddHangfire(configuration =>
            {
                configuration.UseSqlServerStorage(Configuration["ConnectionStrings:SQLServerConnection"])
                .UseColouredConsoleLogProvider();
            });

            // Add framework services.
            services.AddMvc(
                // options => options.Filters.Add(new TrackPerformanceFilter("Backend"))
                ).SetCompatibilityVersion(CompatibilityVersion.Version_2_1)
                .AddJsonOptions(options =>
                {
                    options.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;
                });



            // In production, the Angular files will be served from this directory
            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "ClientApp/dist";
            });


            // Enforce https during production. To quickly enable ssl during development. Go to: Project Properties->Debug->Enable SSL
            if (!_hostingEnvironment.IsDevelopment())
               services.Configure<MvcOptions>(options => options.Filters.Add(new RequireHttpsAttribute()));


            //Todo: ***Using DataAnnotations for validation until Swashbuckle supports FluentValidation***
            //services.AddFluentValidation(fv => fv.RegisterValidatorsFromAssemblyContaining<Startup>());


            // .AddJsonOptions(opts =>
            // {
            //    opts.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();
            // });


            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new Info { Title = IdentityServerConfig.ApiFriendlyName, Version = "v1" });

                c.OperationFilter<AuthorizeCheckOperationFilter>();

                c.AddSecurityDefinition("oauth2", new OAuth2Scheme
                {
                    Type = "oauth2",
                    Flow = "password",
                    TokenUrl = $"{applicationUrl}/connect/token",
                    Scopes = new Dictionary<string, string>()
                    {
                        { IdentityServerConfig.ApiName, IdentityServerConfig.ApiFriendlyName }
                    }
                });

                var xmlCommentsFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
                var xmlCommentsFullPath = Path.Combine(AppContext.BaseDirectory, xmlCommentsFile);

                c.IncludeXmlComments(xmlCommentsFullPath);
            });


            Mapper.Initialize(cfg =>
            {
                cfg.AddProfile<AlertMessageProfile>();
                cfg.AddProfile<ChatMessageProfile>();
                cfg.AddProfile<ChatThreadProfile>();
                cfg.AddProfile<InvoiceProfile>();
                cfg.AddProfile<PermissionProfile>();
                cfg.AddProfile<RoleProfile>();
                cfg.AddProfile<UserProfile>();
                cfg.AddProfile<OrderProfile>();
            });


            // Configurations
            services.Configure<SmtpConfig>(Configuration.GetSection("SmtpConfig"));


            // Business Services
            services.AddScoped<IEmailer, Emailer>();


            // Repositories
            services.AddScoped<IUnitOfWork, HttpUnitOfWork>();
            services.AddScoped<IAccountManager, AccountManager>();

            //Services used by Hangfire
            services.AddScoped<IExchange, Exchange>();
            services.AddScoped<IDataVisualization, DataVisualization>();

            // Auth Handlers
            services.AddSingleton<IAuthorizationHandler, ViewUserAuthorizationHandler>();
            services.AddSingleton<IAuthorizationHandler, ManageUserAuthorizationHandler>();
            services.AddSingleton<IAuthorizationHandler, ViewRoleAuthorizationHandler>();
            services.AddSingleton<IAuthorizationHandler, AssignRolesAuthorizationHandler>();
            services.AddSingleton<IAuthorizationHandler, ViewGroupAuthorizationHandler>();
            services.AddSingleton<IAuthorizationHandler, ManageGroupsAuthorizationHandler>();

            // DB Creation and Seeding
            services.AddTransient<IDatabaseInitializer, IdentityServerDbInitializer>();

            services.AddSignalR();
        }


        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env,
                            ILoggerFactory loggerFactory, IExchange exchange, IDataVisualization dataVisualization)
        {
            loggerFactory.AddConsole(Configuration.GetSection("Logging"));
            // loggerFactory.AddDebug(LogLevel.Warning);
            loggerFactory.AddFile(Configuration.GetSection("Logging"));

            Utilities.ConfigureLogger(loggerFactory);
            EmailTemplates.Initialize(env);


            //Configure Cors
            app.UseCors(builder => builder
                .AllowAnyOrigin()
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials());

            // app.UseHsts();
            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseSpaStaticFiles();
            app.UseIdentityServer();


            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", $"{IdentityServerConfig.ApiFriendlyName} V1");
                c.OAuthClientId(IdentityServerConfig.SwaggerClientID);
                c.OAuthClientSecret("no_password"); //Leaving it blank doesn't work
                c.OAuthAppName("Swagger UI");
            });

            app.UseExceptionHandler(eApp =>
            {
                eApp.Run(async context =>
                {
                    context.Response.StatusCode = 500;
                    context.Response.ContentType = "application/json";

                    var errorCtx = context.Features.Get<IExceptionHandlerFeature>();
                    if (errorCtx != null)
                    {
                        var ex = errorCtx.Error;
                        WebHelper.LogWebError("Backend", ex, context);

                        var errorId = Activity.Current?.Id ?? context.TraceIdentifier;
                        var jsonResponse = JsonConvert.SerializeObject(new CustomErrorResponse
                        {
                            ErrorId = errorId,
                            Message = "An error occurred in the API."
                        });
                        await context.Response.WriteAsync(jsonResponse, Encoding.UTF8);
                    }
                });
            });

            app.UseHangfireServer();
            RecurringJob.AddOrUpdate(
                () => exchange.FetchAndUpdateAppointmentsAsync(),
                Cron.MinuteInterval(6));

            RecurringJob.AddOrUpdate(
                () => dataVisualization.FetchAndUpdateInvoices(),
                Cron.MinuteInterval(4));

            RecurringJob.AddOrUpdate(
                () => dataVisualization.FetchAndUpdateOrders(),
                Cron.MinuteInterval(4));

            app.UseSignalR(routes => routes.MapHub<CommunicationHub>("/communicationhub"));


            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller}/{action=Index}/{id?}");
            });

            app.UseSpa(spa =>
            {
                // To learn more about options for serving an Angular SPA from ASP.NET Core,
                // see https://go.microsoft.com/fwlink/?linkid=864501

                spa.Options.SourcePath = "ClientApp";

                if (env.IsDevelopment())
                {
                    //Option to start its own instance of the Angular CLI server in the background when the ASP.NET Core app starts in development mode.
                    spa.UseAngularCliServer(npmScript: "start");
                    spa.Options.StartupTimeout = TimeSpan.FromSeconds(60); // Increase the timeout if angular app is taking longer to startup

                    //Option for using the external Angular CLI instance 
                    //spa.UseProxyToSpaDevelopmentServer("http://localhost:4200");

                }
            });
        }
    }
}
