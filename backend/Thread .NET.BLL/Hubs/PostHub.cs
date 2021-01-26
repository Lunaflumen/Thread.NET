using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using Thread_.NET.Common.DTO.Post;

namespace Thread_.NET.BLL.Hubs
{
    public sealed class PostHub : Hub
    {
        public async Task Send(PostDTO post)
        {
            await Clients.All.SendAsync("NewPost", post);
        }

        public async Task Edit(PostDTO editedPost)
        {
            await Clients.All.SendAsync("EditPost", editedPost);
        }

        public async Task Delete(int postId)
        {
            await Clients.All.SendAsync("DeletePost", postId);
        }

        public async Task Like(int postId)
        {
            await Clients.All.SendAsync("LikePost", postId);
        }

        public async Task Dislike(int postId)
        {
            await Clients.All.SendAsync("DislikePost", postId);
        }
    }
}
