using Microsoft.AspNetCore.Mvc.Filters;
using System.Collections.Generic;

namespace WasaCommunity.Logging
{    
    public class TrackPerformanceFilter : IActionFilter
    {
        private PerformanceTracker _tracker;
        private string _layer;
        public TrackPerformanceFilter(string layer)
        {
            _layer = layer;
        }        

        public void OnActionExecuting(ActionExecutingContext context)
        {            
            var request = context.HttpContext.Request;
            var activity = $"{request.Path}-{request.Method}";

            var dict = new Dictionary<string, object>();
            foreach (var key in context.RouteData.Values?.Keys)
                dict.Add($"RouteData-{key}", (string)context.RouteData.Values[key]);

            var performanceLog = WebHelper.CreatePerformanceLog(activity, context.HttpContext, _layer, dict);

            _tracker = new PerformanceTracker(performanceLog);
        }
        public void OnActionExecuted(ActionExecutedContext context)
        {
            if (_tracker != null)
                _tracker.Stop();
        }
    }
}
