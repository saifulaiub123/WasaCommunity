using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace DAL.Models
{
    public class BackendErrorLog : BaseLog
    {
        [NotMapped]
        public Exception Exception { get; set; }  // the exception for error logging

        public string CustomException { get; set; }

    }
}