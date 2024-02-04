// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

using System;
using System.Linq;

namespace WasaCommunity.Resources
{
    /// <summary>
    /// Represents a claim that is used for permissions throughout the application
    /// </summary>
    public class ClaimResource
    {
        /// <summary>
        /// The type of claim
        /// </summary>
        public string Type { get; set; }

        /// <summary>
        /// The value of the claim
        /// </summary>
        public string Value { get; set; }
    }
}
