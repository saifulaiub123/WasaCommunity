// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using DAL.Models;

namespace WasaCommunity.Resources
{

    /// <summary>
    /// Represents a resource for a frontend error by location
    /// </summary>
    public class FrontendErrorsByLocationResource
    {
        public string Location { get; set; }
        public int AmountOfErrors { get; set; }
        public int AmountOfUsersAffected { get; set; }
        public IEnumerable<FrontendErrorLog> Errors { get; set; }
    }
}