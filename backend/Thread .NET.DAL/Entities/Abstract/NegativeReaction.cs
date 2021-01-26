namespace Thread_.NET.DAL.Entities.Abstract
{
    public abstract class NegativeReaction : BaseEntity
    {
        public int UserId { get; set; }
        public User User { get; set; }

        public bool IsDislike { get; set; }
    }
}
