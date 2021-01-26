using Thread_.NET.Common.DTO.User;

namespace Thread_.NET.Common.DTO.Dislike
{
    public sealed class NegativeReactionDTO
    {
        public bool IsDislike { get; set; }
        public UserDTO User { get; set; }
    }
}