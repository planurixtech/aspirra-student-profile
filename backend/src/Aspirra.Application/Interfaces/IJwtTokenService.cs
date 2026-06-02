using Aspirra.Domain.Entities;

namespace Aspirra.Application.Interfaces;

public interface IJwtTokenService
{
    string CreateAccessToken(User user);
    DateTime GetAccessTokenExpiry();
}
