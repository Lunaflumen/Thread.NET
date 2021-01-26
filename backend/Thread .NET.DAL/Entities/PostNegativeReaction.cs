using Thread_.NET.DAL.Entities.Abstract;

namespace Thread_.NET.DAL.Entities
{
    public sealed class PostNegativeReaction : NegativeReaction
    {
        public int PostId { get; set; }
        public Post Post { get; set; }
    }
}
