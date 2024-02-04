using System.Collections.Generic;
using DAL.Models;

namespace WasaCommunity.Resources
{
    /// <summary>
    /// Represents a resource for a backend error by location
    /// </summary>
    public class BackendErrorsByLocationResource
    {
        public string Location { get; set; }
        public int AmountOfErrors { get; set; }
        public int AmountOfUsersAffected { get; set; }
        public IEnumerable<BackendErrorLog> Errors { get; set; }
    }
}