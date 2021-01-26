using AutoMapper;
using Thread_.NET.Common.DTO.Dislike;
using Thread_.NET.DAL.Entities.Abstract;

namespace Thread_.NET.BLL.MappingProfiles
{
    public sealed class NegativeReactionProfile : Profile
    {
        public NegativeReactionProfile()
        {
            CreateMap<NegativeReaction, NegativeReactionDTO>();
            CreateMap<NegativeReactionDTO, NegativeReaction>();
        }
    }
}
