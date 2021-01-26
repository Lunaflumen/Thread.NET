using AutoMapper;
using Microsoft.AspNetCore.SignalR;
using System.Linq;
using System.Threading.Tasks;
using Thread_.NET.BLL.Hubs;
using Thread_.NET.BLL.Services.Abstract;
using Thread_.NET.Common.DTO.Like;
using Thread_.NET.DAL.Context;
using Thread_.NET.DAL.Entities;

namespace Thread_.NET.BLL.Services
{
    public sealed class LikeService : BaseService
    {
        private readonly IHubContext<PostHub> _postHub;
        public LikeService(ThreadContext context, IMapper mapper, IHubContext<PostHub> postHub) : base(context, mapper) 
        {
            _postHub = postHub;
        }

        public async Task LikePost(NewReactionDTO reaction)
        {
            var likes = _context.PostReactions.Where(x => x.UserId == reaction.UserId && x.PostId == reaction.EntityId);

            var dislikes = _context.PostNegativeReactions.Where(x => x.UserId == reaction.UserId && x.PostId == reaction.EntityId);

            if (likes.Any())
            {
                _context.PostReactions.RemoveRange(likes);
                await _context.SaveChangesAsync();
                await _postHub.Clients.All.SendAsync("LikePost", reaction.EntityId);

                return;
            }

            if (dislikes.Any())
            {
                _context.PostNegativeReactions.RemoveRange(dislikes);
                await _context.SaveChangesAsync();
            }

            _context.PostReactions.Add(new DAL.Entities.PostReaction
            {
                PostId = reaction.EntityId,
                IsLike = reaction.IsLike,
                UserId = reaction.UserId
            });

            await _context.SaveChangesAsync();

            await _postHub.Clients.All.SendAsync("LikePost", reaction.EntityId);
        }
    }
}
