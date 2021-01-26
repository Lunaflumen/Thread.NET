using System.ComponentModel.DataAnnotations;

namespace Thread_.NET.Common.DTO.Email
{
    public sealed class EmailDTO
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }
        public string Subject { get; set; }
        public string UserName { get; set; } = "";
        public string Avatar { get; set; } = "";
        public string Body { get; set; } = "";
        public string Img { get; set; } = "";
        public string Href { get; set; } = "#";
    }
}
