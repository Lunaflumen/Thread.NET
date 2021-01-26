using AutoMapper;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using Thread_.NET.BLL.Services.Abstract;
using Thread_.NET.Common.DTO.Comment;
using Thread_.NET.DAL.Context;
using Thread_.NET.DAL.Entities;
using Thread_.NET.BLL.Exceptions;
using System;
using Microsoft.AspNetCore.SignalR;
using Thread_.NET.BLL.Hubs;
using System.Collections.Generic;

namespace Thread_.NET.BLL.Services
{
    public sealed class CommentService : BaseService
    {
        private readonly IHubContext<CommentHub> _commentHub;
        public CommentService(ThreadContext context, IHubContext<CommentHub> commentHub, IMapper mapper) : base(context, mapper) 
        {
            _commentHub = commentHub;
        }

        public async Task<ICollection<CommentDTO>> GetAllComments()
        {
            var comments = await _context.Comments
                .Include(comment => comment.Author)
                    .ThenInclude(author => author.Avatar)
                .Include(comment => comment.Reactions)
                    .ThenInclude(reaction => reaction.User)
                .Include(comment => comment.NegativeReactions)
                    .ThenInclude(reaction => reaction.User)
                .OrderByDescending(comment => comment.CreatedAt)
                .ToListAsync();

            return _mapper.Map<ICollection<CommentDTO>>(comments);
        }

        public async Task<CommentDTO> CreateComment(NewCommentDTO newComment)
        {
            var commentEntity = _mapper.Map<Comment>(newComment);

            _context.Comments.Add(commentEntity);
            await _context.SaveChangesAsync();

            var createdComment = await _context.Comments
                .Include(comment => comment.Author)
                    .ThenInclude(user => user.Avatar)
                .FirstAsync(comment => comment.Id == commentEntity.Id);

            var createdCommentDTO = _mapper.Map<CommentDTO>(createdComment);
            await _commentHub.Clients.All.SendAsync("NewComment", createdCommentDTO, newComment.PostId);

            return _mapper.Map<CommentDTO>(createdComment);
        }

        public async Task EditComment(CommentDTO commentDto)
        {
            var commentEntity = await GetCommentByIdInternal(commentDto.Id);
            if (commentEntity == null)
            {
                throw new NotFoundException(nameof(Comment), commentDto.Id);
            }

            var timeNow = DateTime.Now;

            commentEntity.Id = commentDto.Id;
            commentEntity.UpdatedAt = timeNow;

            if (!string.IsNullOrEmpty(commentDto.Body))
            {
                if (commentEntity.Body == null)
                {
                    commentEntity.Body = new Comment
                    {
                        Body = commentDto.Body
                    };
                }
                else
                {
                    commentEntity.Body = commentDto.Body;
                    commentEntity.UpdatedAt = timeNow;
                }
            }
            else
            {
                if (commentEntity.Body != null)
                {
                    _context.Comments.Remove(commentEntity);
                }
            }

            var editedCommentDTO = _mapper.Map<CommentDTO>(commentEntity);
            await _commentHub.Clients.All.SendAsync("EditComment", editedCommentDTO, commentEntity.PostId);

            _context.Comments.Update(commentEntity);
            await _context.SaveChangesAsync();
        }


        public async Task DeleteComment(int commentId)
        {
            while (_context.CommentReactions.Any(x => x.CommentId == commentId))
            {
                var reactionEntity = await _context.CommentReactions.FirstOrDefaultAsync(x => x.CommentId == commentId);
                _context.CommentReactions.Remove(reactionEntity);
                await _context.SaveChangesAsync();
            }

            while (_context.CommentNegativeReactions.Any(x => x.CommentId == commentId))
            {
                var reactionEntity = await _context.CommentNegativeReactions.FirstOrDefaultAsync(x => x.CommentId == commentId);
                _context.CommentNegativeReactions.Remove(reactionEntity);
                await _context.SaveChangesAsync();
            }

            var commentEntity = await _context.Comments.FirstOrDefaultAsync(x => x.Id == commentId);

            if (commentEntity == null)
            {
                throw new NotFoundException(nameof(Comment), commentId);
            }

            _context.Comments.Remove(commentEntity);
            await _context.SaveChangesAsync();

            await _commentHub.Clients.All.SendAsync("DeleteComment", commentId, commentEntity.PostId);
        }

        private async Task<Comment> GetCommentByIdInternal(int id)
        {
            return await _context.Comments
                .FirstOrDefaultAsync(p => p.Id == id);
        }
    }
}
