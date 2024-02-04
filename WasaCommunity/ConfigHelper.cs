// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

using System.IO;
using Microsoft.Extensions.Configuration;

namespace WasaCommunity
{
    public class ConfigHelper
    {

        private static ConfigHelper _appSettings;

        public string appSettingValue { get; set; }

        public static string ConnectionString(string Section, string Key)
        {
            _appSettings = GetCurrentSettings(Section, Key);
            return _appSettings.appSettingValue;
        }

        public ConfigHelper(IConfiguration config, string Key)
        {
            this.appSettingValue = config.GetValue<string>(Key);
        }

        public static ConfigHelper GetCurrentSettings(string Section, string Key)
        {
            var builder = new ConfigurationBuilder()
                            .SetBasePath(Directory.GetCurrentDirectory())
                            .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                            .AddJsonFile("appsettings.Development.json", optional: true)
                            .AddJsonFile("appsettings.production.json", optional: true)
                            .AddEnvironmentVariables();

            IConfigurationRoot configuration = builder.Build();

            var settings = new ConfigHelper(configuration.GetSection(Section), Key);

            return settings;
        }
    }
}
