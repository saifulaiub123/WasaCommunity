using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace DAL.Models
{
    public class FrontendErrorLog : BaseLog
    {
        public string OriginalMessage { get; set; }

        // [NotMapped]
        // public Dictionary<string, object> AdditionalErrorInfo { get; set; }
    }
}