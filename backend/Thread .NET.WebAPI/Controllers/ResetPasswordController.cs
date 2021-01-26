using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Thread_.NET.BLL.Services;
using Thread_.NET.Common.DTO.Auth;
using Thread_.NET.Common.DTO.User;

namespace Thread_.NET.Controllers
{
    [Route("api/[controller]")]
    [AllowAnonymous]
    [ApiController]
    public class ResetPasswordController : ControllerBase
    {
        private readonly UserService _userService;
        private readonly AuthService _authService;

        public ResetPasswordController(UserService userService, AuthService authService)
        {
            _userService = userService;
            _authService = authService;
        }

        [HttpPost("forgotPassword")]
        public async Task<IActionResult> ForgotPassword(ForgotPasswordDTO forgotPasswordDTO)
        {

            var user = await _userService.GetUserByEmail(forgotPasswordDTO.Email);
            if (user == null)
                return Ok();

            var token = await _authService.GenerateAccessToken(user.Id, user.UserName, user.Email);
            string callback = $"{forgotPasswordDTO.Href}new-password";

            EmailService emailService = new EmailService();
            await emailService.SendEmailAsync(forgotPasswordDTO.Email, "Reset Password",
                body: $"If you want reset your password <a href='{callback}'>click here</a>");

            return Ok(new ResetPasswordUserDTO 
            {
                User = user,
                Token = new AccessTokenDTO(accessToken: token.AccessToken, refreshToken: token.RefreshToken)
            });
        }

        [HttpPost("resetPassword")]
        public async Task<IActionResult> ResetPassword(ResetPasswordDTO resetPasswordDTO)
        {
            await _userService.NewPassword(resetPasswordDTO);
            return Ok();
        }
    }
}
