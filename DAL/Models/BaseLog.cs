using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using Newtonsoft.Json;

namespace DAL.Models
{
    public class BaseLog
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public DateTime Timestamp { get; private set; } = DateTime.UtcNow;
        public string Layer { get; set; }
        public string Location { get; set; }
        public string Message { get; set; }
        public string UserId { get; set; }
        public string UserName { get; set; }
        public string HostName { get; set; }
        // public string CorrelationId { get; set; }
    
        // public Dictionary<string, object> AdditionalInfo { get; set; }
    }
}