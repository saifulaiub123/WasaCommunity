using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DAL.Models
{
    public class GroupUser
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Required]
        public int Id { get; set; }

        [Required]
        public string GroupId { get; set; }

        [Required]
        public Group Group { get; set; }

        [Required]
        public string MemberId { get; set; }

        [Required]
        public User Member { get; set; }
    }
}