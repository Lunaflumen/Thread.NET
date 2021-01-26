using System.ComponentModel.DataAnnotations;

namespace Thread_.NET.Common.DTO.User
{
    public class ForgotPasswordDTO 
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        public string Href { get; set; }
    }
}