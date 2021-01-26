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
    public sealed class DislikeService : BaseService
    {
        private readonly IHubContext<PostHub> _postHub;
        public DislikeService(ThreadContext context, IMapper mapper, IHubContext<PostHub> postHub) : base(context, mapper)
        {
            _postHub = postHub;
        }

        public async Task DislikePost(NewNegativeReactionDTO reaction)
        {
            var dislikes = _context.PostNegativeReactions.Where(x => x.UserId == reaction.UserId && x.PostId == reaction.EntityId);
            var likes = _context.PostReactions.Where(x => x.UserId == reaction.UserId && x.PostId == reaction.EntityId);

            if (dislikes.Any())
            {
                _context.PostNegativeReactions.RemoveRange(dislikes);
                await _context.SaveChangesAsync();
                await _postHub.Clients.All.SendAsync("DislikePost", reaction.EntityId);

                return;
            }

            if (likes.Any())
            {
                _context.PostReactions.RemoveRange(likes);
                await _context.SaveChangesAsync();
            }

            _context.PostNegativeReactions.Add(new DAL.Entities.PostNegativeReaction
            {
                PostId = reaction.EntityId,
                IsDislike = reaction.IsDislike,
                UserId = reaction.UserId
            });

            await _context.SaveChangesAsync();

            await _postHub.Clients.All.SendAsync("DislikePost", reaction.EntityId);
        }
    }
}
