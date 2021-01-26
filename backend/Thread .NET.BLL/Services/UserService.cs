using AutoMapper;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Thread_.NET.BLL.Exceptions;
using Thread_.NET.BLL.Services.Abstract;
using Thread_.NET.Common.DTO.User;
using Thread_.NET.Common.Security;
using Thread_.NET.DAL.Context;
using Thread_.NET.DAL.Entities;

namespace Thread_.NET.BLL.Services
{
    public sealed class UserService : BaseService
    {
        private AuthService _authService;
        public UserService(ThreadContext context, IMapper mapper, AuthService authService) : base(context, mapper) 
        {
            _authService = authService;
        }

        public async Task<ICollection<UserDTO>> GetUsers()
        {
            var users = await _context.Users
                .Include(x => x.Avatar)
                .ToListAsync();

            return _mapper.Map<ICollection<UserDTO>>(users);
        }

        public async Task<UserDTO> GetUserById(int id)
        {
            var user = await GetUserByIdInternal(id);
            if (user == null)
            {
                throw new NotFoundException(nameof(User), id);
            }

            return _mapper.Map<UserDTO>(user);
        }

        public async Task<UserDTO> GetUserByEmail(string email)
        {
            var user = await GetUserByEmailInternal(email);
            if (user == null)
            {
                throw new NotFoundException(nameof(User));
            }

            return _mapper.Map<UserDTO>(user);
        }

        public async Task<UserDTO> CreateUser(UserRegisterDTO userDto)
        {
            var userEntity = _mapper.Map<User>(userDto);
            var salt = SecurityHelper.GetRandomBytes();

            userEntity.Salt = Convert.ToBase64String(salt);
            userEntity.Password = SecurityHelper.HashPassword(userDto.Password, salt);

            _context.Users.Add(userEntity);
            await _context.SaveChangesAsync();

            return _mapper.Map<UserDTO>(userEntity);
        }

        public async Task UpdateUser(UserDTO userDto)
        {
            var userEntity = await GetUserByIdInternal(userDto.Id);
            if (userEntity == null)
            {
                throw new NotFoundException(nameof(User), userDto.Id);
            }

            var timeNow = DateTime.Now;

            userEntity.Email = userDto.Email;
            userEntity.UserName = userDto.UserName;
            userEntity.UpdatedAt = timeNow;

            if (!string.IsNullOrEmpty(userDto.Avatar))
            {
                if (userEntity.Avatar == null)
                {
                    userEntity.Avatar = new Image
                    {
                        URL = userDto.Avatar
                    };
                }
                else
                {
                    userEntity.Avatar.URL = userDto.Avatar;
                    userEntity.Avatar.UpdatedAt = timeNow;
                }
            }
            else
            {
                if (userEntity.Avatar != null)
                {
                    _context.Images.Remove(userEntity.Avatar);
                }
            }

            _context.Users.Update(userEntity);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteUser(int userId)
        {
            var userEntity = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);

            if (userEntity == null)
            {
                throw new NotFoundException(nameof(User), userId);
            }

            _context.Users.Remove(userEntity);
            await _context.SaveChangesAsync();
        }

        public async Task NewPassword(ResetPasswordDTO resetPasswordDTO)
        {
            var token = resetPasswordDTO.ResetToken.Replace("\\", "").Replace("\"", "");
            
            var userId = _context.RefreshTokens
                .Where(RefreshToken => RefreshToken.Token == token)
                .Select(RefreshToken => RefreshToken.UserId).First();
            var userEntity = await GetUserByIdInternal(userId);
            if (userEntity == null)
            {
                throw new NotFoundException(nameof(User));
            }

            var timeNow = DateTime.Now;

            //byte[] salt = new byte[] { };
            //foreach(char i in userEntity.Salt.ToCharArray())
            //{
            //    salt.Append(Convert.ToByte(i));
            //}

            userEntity.Password = SecurityHelper.HashPassword(resetPasswordDTO.Password, Convert.FromBase64String(userEntity.Salt));
            userEntity.UpdatedAt = timeNow;
            _context.Users.Update(userEntity);

            await _context.SaveChangesAsync();
            await _authService.RevokeRefreshToken(token, userId);
        }

        private async Task<User> GetUserByIdInternal(int id)
        {
            return await _context.Users
                .Include(u => u.Avatar)
                .FirstOrDefaultAsync(u => u.Id == id);
        }

        private async Task<User> GetUserByEmailInternal(string email)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Email == email);
        }
    }
}
