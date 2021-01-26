using AutoMapper;
using Microsoft.AspNetCore.SignalR;
using System.Linq;
using System.Threading.Tasks;
using Thread_.NET.BLL.Hubs;
using Thread_.NET.BLL.Services.Abstract;
using Thread_.NET.Common.DTO.Like;
using Thread_.NET.DAL.Context;

namespace Thread_.NET.BLL.Services
{
    public sealed class LikeCommentService : BaseService
    {
        private readonly IHubContext<CommentHub> _commentHub;
        public LikeCommentService(ThreadContext context, IHubContext<CommentHub> commentHub, IMapper mapper) : base(context, mapper) 
        {
            _commentHub = commentHub;
        }

        public async Task LikeComment(NewReactionDTO reaction)
        {
            var likes = _context.CommentReactions.Where(x => x.UserId == reaction.UserId && x.CommentId == reaction.EntityId);

            var dislikes = _context.CommentNegativeReactions.Where(x => x.UserId == reaction.UserId && x.CommentId == reaction.EntityId);

            if (likes.Any())
            {
                _context.CommentReactions.RemoveRange(likes);
                await _context.SaveChangesAsync();
                await _commentHub.Clients.All.SendAsync("LikeComment", reaction.EntityId);

                return;
            }

            if (dislikes.Any())
            {
                _context.CommentNegativeReactions.RemoveRange(dislikes);
                await _context.SaveChangesAsync();
            }

            _context.CommentReactions.Add(new DAL.Entities.CommentReaction
            {
                CommentId = reaction.EntityId,
                IsLike = reaction.IsLike,
                UserId = reaction.UserId
            });

            await _context.SaveChangesAsync();

            await _commentHub.Clients.All.SendAsync("LikeComment", reaction.EntityId);
        }
    }
}
