using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace DAL.Models
{
    public class Group
    {
        [Required]
        public string Id { get; set; }

        [Required]
        [StringLength(50)]
        public string Name { get; set; }

        public ICollection<GroupUser> GroupUsers { get; set; } = new List<GroupUser>();
    }
}