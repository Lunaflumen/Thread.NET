namespace Thread_.NET.Common.DTO.Dislike
{
    public sealed class NewNegativeReactionDTO
    {
        public int EntityId { get; set; }
        public bool IsDislike { get; set; }
        public int UserId { get; set; }
    }
}
