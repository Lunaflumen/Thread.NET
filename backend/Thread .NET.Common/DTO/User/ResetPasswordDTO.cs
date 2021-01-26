using System.ComponentModel.DataAnnotations;

namespace Thread_.NET.Common.DTO.User
{
    public class ResetPasswordDTO
    {
        public string ResetToken { get; set; }

        [Required]
        [DataType(DataType.Password)]
        public string Password { get; set; }

    }
}