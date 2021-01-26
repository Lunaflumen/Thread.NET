using Thread_.NET.DAL.Entities.Abstract;

namespace Thread_.NET.DAL.Entities
{
    public sealed class CommentNegativeReaction : NegativeReaction
    {
        public int CommentId { get; set; }
        public Comment Comment { get; set; }
    }
}
