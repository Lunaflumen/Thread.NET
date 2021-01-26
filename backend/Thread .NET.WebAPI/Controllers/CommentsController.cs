using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Thread_.NET.BLL.Services;
using Thread_.NET.Common.DTO.Comment;
using Thread_.NET.Common.DTO.Like;
using Thread_.NET.Common.DTO.Dislike;
using Thread_.NET.Extensions;
using System.Collections.Generic;

namespace Thread_.NET.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [Authorize]
    [ApiController]
    public class CommentsController : ControllerBase
    {
        private readonly CommentService _commentService;
        private readonly LikeCommentService _likeCommentService;
        private readonly DislikeCommentService _dislikeCommentService;

        public CommentsController(CommentService commentService, LikeCommentService likeCommentService, DislikeCommentService dislikeCommentService)
        {
            _commentService = commentService;
            _likeCommentService = likeCommentService;
            _dislikeCommentService = dislikeCommentService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<ICollection<CommentDTO>>> Get()
        {
            return Ok(await _commentService.GetAllComments());
        }

        [HttpPut]
        public async Task<IActionResult> Put([FromBody] CommentDTO comment)
        {
            await _commentService.EditComment(comment);
            return NoContent();
        }

        [HttpPost]
        public async Task<ActionResult<CommentDTO>> CreatePost([FromBody] NewCommentDTO comment)
        {
            comment.AuthorId = this.GetUserIdFromToken();
            return Ok(await _commentService.CreateComment(comment));
        }

        [HttpPost("likeComment")]
        public async Task<IActionResult> LikeComment(NewReactionDTO reaction)
        {
            reaction.UserId = this.GetUserIdFromToken();

            await _likeCommentService.LikeComment(reaction);
            return Ok();
        }

        [HttpPost("dislikeComment")]
        public async Task<IActionResult> DislikeComment(NewNegativeReactionDTO reaction)
        {
            reaction.UserId = this.GetUserIdFromToken();

            await _dislikeCommentService.DislikeComment(reaction);
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteComment(int id)
        {
            await _commentService.DeleteComment(id);
            return NoContent();
        }
    }
}