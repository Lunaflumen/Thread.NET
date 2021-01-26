using AutoMapper;
using Microsoft.AspNetCore.SignalR;
using System.Linq;
using System.Threading.Tasks;
using Thread_.NET.BLL.Hubs;
using Thread_.NET.BLL.Services.Abstract;
using Thread_.NET.Common.DTO.Dislike;
using Thread_.NET.DAL.Context;

namespace Thread_.NET.BLL.Services
{
    public sealed class DislikeCommentService : BaseService
    {
        private readonly IHubContext<CommentHub> _commentHub;
        public DislikeCommentService(ThreadContext context, IHubContext<CommentHub> commentHub, IMapper mapper) : base(context, mapper)
        {
            _commentHub = commentHub;
        }

        public async Task DislikeComment(NewNegativeReactionDTO reaction)
        {
            var likes = _context.CommentNegativeReactions.Where(x => x.UserId == reaction.UserId && x.CommentId == reaction.EntityId);

            var dislikes = _context.CommentReactions.Where(x => x.UserId == reaction.UserId && x.CommentId == reaction.EntityId);

            if (likes.Any())
            {
                _context.CommentNegativeReactions.RemoveRange(likes);
                await _context.SaveChangesAsync();
                await _commentHub.Clients.All.SendAsync("DislikeComment", reaction.EntityId);

                return;
            }

            if (dislikes.Any())
            {
                _context.CommentReactions.RemoveRange(dislikes);
                await _context.SaveChangesAsync();
            }

            _context.CommentNegativeReactions.Add(new DAL.Entities.CommentNegativeReaction
            {
                CommentId = reaction.EntityId,
                IsDislike = reaction.IsDislike,
                UserId = reaction.UserId
            });

            await _context.SaveChangesAsync();

            await _commentHub.Clients.All.SendAsync("DislikeComment", reaction.EntityId);
        }
    }
}
