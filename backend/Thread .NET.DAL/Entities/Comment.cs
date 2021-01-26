using System;
using System.Collections.Generic;
using Thread_.NET.DAL.Entities.Abstract;

namespace Thread_.NET.DAL.Entities
{
    public sealed class Comment : BaseEntity
    {
        public Comment()
        {
            Reactions = new List<CommentReaction>();
            NegativeReactions = new List<CommentNegativeReaction>();
        }

        public int AuthorId { get; set; }
        public User Author { get; set; }

        public int PostId { get; set; }
        public Post Post { get; set; }

        public string Body { get; set; }

        public ICollection<CommentReaction> Reactions { get; private set; }
        public ICollection<CommentNegativeReaction> NegativeReactions { get; private set; }

        public static implicit operator string(Comment v)
        {
            throw new NotImplementedException();
        }
    }
}
