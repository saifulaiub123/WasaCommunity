using System.Collections.Generic;
using DAL.Models;

namespace WasaCommunity.Resources
{
    /// <summary>
    /// Represents a resource for the average performance
    /// </summary>
    public class AveragePerformanceResource
    {
        public string Message { get; set; }
        public double AverageMilliseconds { get; set; }
        public IEnumerable<PerformanceLog> PerformanceLogs { get; set; }
    }
}