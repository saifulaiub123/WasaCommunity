using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using DAL.Models;

namespace WasaCommunity.Logging
{
    public class PerformanceTracker
    {
        private readonly Stopwatch _sw;
        private readonly PerformanceLog performanceLog;

        public PerformanceTracker(PerformanceLog log)
        {
            _sw = Stopwatch.StartNew();
            performanceLog = log;            

            var beginTime = DateTime.Now;
            // if (performanceLog.AdditionalInfo == null)
            //     performanceLog.AdditionalInfo = new Dictionary<string, object>()
            //     {
            //         { "Started", beginTime.ToString(CultureInfo.InvariantCulture) }
            //     };
            // else
            //     performanceLog.AdditionalInfo.Add(
            //         "Started", beginTime.ToString(CultureInfo.InvariantCulture));
        }
        public PerformanceTracker(string name, string userId, string userName,
                   string location, string layer)
        {            
            performanceLog = new PerformanceLog
            {
                Message = name,
                UserId = userId,
                UserName = userName,
                Layer = layer,
                Location = location,
                HostName = Environment.MachineName
            };
            
            var beginTime = DateTime.Now;
            // performanceLog.AdditionalInfo = new Dictionary<string, object>()
            // {
            //     { "Started", beginTime.ToString(CultureInfo.InvariantCulture)  }
            // };
        }

        public PerformanceTracker(string name, string userId, string userName,
                   string location, string layer,
                   Dictionary<string, object> perfParams)
            : this(name, userId, userName, location, layer)
        {
            // foreach (var item in perfParams)
            //     performanceLog.AdditionalInfo.Add("input-" + item.Key, item.Value);
        }

        public void Stop()
        {
            _sw.Stop();
            performanceLog.ElapsedMilliseconds = _sw.ElapsedMilliseconds;
            if (performanceLog.ElapsedMilliseconds > 0) 
            {
                Logger.WritePerformance(performanceLog);
            }

        }
    }
}
