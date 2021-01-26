using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using Thread_.NET.Common.DTO.Comment;

namespace Thread_.NET.BLL.Hubs
{
    public sealed class CommentHub : Hub
    {
        public async Task Send(CommentDTO comment, int postId)
        {
            await Clients.All.SendAsync("NewComment", comment, postId);
        }

        public async Task Edit(CommentDTO editedComment, int postId)
        {
            await Clients.All.SendAsync("EditComment", editedComment, postId);
        }

        public async Task Delete(int commentId, int postId)
        {
            await Clients.All.SendAsync("DeletePost", commentId, postId);
        }

        public async Task Like(int commentId)
        {
            await Clients.All.SendAsync("LikeComment", commentId);
        }

        public async Task Dislike(int commentId)
        {
            await Clients.All.SendAsync("DislikeComment", commentId);
        }
    }
}
