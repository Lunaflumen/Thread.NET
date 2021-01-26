using AutoMapper;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Thread_.NET.BLL.Exceptions;
using Thread_.NET.BLL.Hubs;
using Thread_.NET.BLL.Services.Abstract;
using Thread_.NET.Common.DTO.Post;
using Thread_.NET.DAL.Context;
using Thread_.NET.DAL.Entities;

namespace Thread_.NET.BLL.Services
{
    public sealed class PostService : BaseService
    {
        private readonly IHubContext<PostHub> _postHub;
        private readonly CommentService _commentService;

        public PostService(ThreadContext context, IMapper mapper, IHubContext<PostHub> postHub, CommentService commentService)
                            : base(context, mapper)
        {
            _postHub = postHub;
            _commentService = commentService;
        }

        public async Task<ICollection<PostDTO>> GetAllPosts()
        {
            var posts = await _context.Posts
                .Include(post => post.Author)
                    .ThenInclude(author => author.Avatar)
                .Include(post => post.Preview)
                .Include(post => post.Reactions)
                    .ThenInclude(reaction => reaction.User)
                .Include(post => post.NegativeReactions)
                    .ThenInclude(reaction => reaction.User)
                .Include(post => post.Comments)
                    .ThenInclude(comment => comment.Reactions)
                .Include(post => post.Comments)
                    .ThenInclude(comment => comment.NegativeReactions)
                .Include(post => post.Comments)
                    .ThenInclude(comment => comment.Author)
                .OrderByDescending(post => post.CreatedAt)
                .ToListAsync();

            return _mapper.Map<ICollection<PostDTO>>(posts);
        }

        public async Task<ICollection<PostDTO>> GetAllPosts(int userId)
        {
            var posts = await _context.Posts
                .Include(post => post.Author)
                    .ThenInclude(author => author.Avatar)
                .Include(post => post.Preview)
                .Include(post => post.Comments)
                    .ThenInclude(comment => comment.Author)
                .Where(p => p.AuthorId == userId) // Filter here
                .ToListAsync();

            return _mapper.Map<ICollection<PostDTO>>(posts);
        }

        public async Task<PostDTO> CreatePost(PostCreateDTO postDto)
        {
            var postEntity = _mapper.Map<Post>(postDto);

            _context.Posts.Add(postEntity);
            await _context.SaveChangesAsync();

            var createdPost = await _context.Posts
                .Include(post => post.Author)
                    .ThenInclude(author => author.Avatar)
                .FirstAsync(post => post.Id == postEntity.Id);

            var createdPostDTO = _mapper.Map<PostDTO>(createdPost);
            await _postHub.Clients.All.SendAsync("NewPost", createdPostDTO);

            return createdPostDTO;
        }

        public async Task EditPost(PostDTO postDto)
        {
            var postEntity = await GetPostByIdInternal(postDto.Id);
            if (postEntity == null)
            {
                throw new NotFoundException(nameof(Post), postDto.Id);
            }

            var timeNow = DateTime.Now;

            postEntity.Id = postDto.Id;
            postEntity.UpdatedAt = timeNow;

            if (!string.IsNullOrEmpty(postDto.PreviewImage))
            {
                if (postEntity.Preview == null)
                {
                    postEntity.Preview = new Image
                    {
                        URL = postDto.PreviewImage
                    };
                }
                else
                {
                    postEntity.Preview.URL = postDto.PreviewImage;
                    postEntity.Preview.UpdatedAt = timeNow;
                }
            }
            else
            {
                if (postEntity.Preview != null)
                {
                    _context.Images.Remove(postEntity.Preview);
                }
            }

            if (!string.IsNullOrEmpty(postDto.Body))
            {
                postEntity.Body = postDto.Body;
                postEntity.UpdatedAt = timeNow;
            }
            else
            {
                if (postEntity.Body != null)
                {
                    _context.Posts.Remove(postEntity);
                }
            }

            var editedPostDTO = _mapper.Map<PostDTO>(postEntity);
            await _postHub.Clients.All.SendAsync("EditPost", editedPostDTO);

            _context.Posts.Update(postEntity);
            await _context.SaveChangesAsync();
        }

        public async Task DeletePost(int postId)
        {
            while (_context.Comments.Any(x => x.PostId == postId))
            {
                var commentEntity = await _context.Comments.FirstOrDefaultAsync(x => x.PostId == postId);
                await _commentService.DeleteComment(commentEntity.Id);
            }

            while (_context.PostReactions.Any(x => x.PostId == postId))
            {
                var reactionEntity = await _context.PostReactions.FirstOrDefaultAsync(x => x.PostId == postId);
                _context.PostReactions.Remove(reactionEntity);
                await _context.SaveChangesAsync();
            }

            while (_context.PostNegativeReactions.Any(x => x.PostId == postId))
            {
                var reactionEntity = await _context.PostNegativeReactions.FirstOrDefaultAsync(x => x.PostId == postId);
                _context.PostNegativeReactions.Remove(reactionEntity);
                await _context.SaveChangesAsync();
            }

            var postEntity = await _context.Posts.FirstOrDefaultAsync(x => x.Id == postId);

            if (postEntity == null)
            {
                throw new NotFoundException(nameof(Post), postId);
            }

            _context.Posts.Remove(postEntity);
            await _context.SaveChangesAsync();

            await _postHub.Clients.All.SendAsync("DeletePost", postId);
        }

        private async Task<Post> GetPostByIdInternal(int id)
        {
            return await _context.Posts
                .Include(p => p.Preview)
                .FirstOrDefaultAsync(p => p.Id == id);
        }
    }
}
