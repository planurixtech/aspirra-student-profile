using Microsoft.EntityFrameworkCore;
using Aspirra.Application.Common;
using Aspirra.Application.DTOs.Auth;
using Aspirra.Application.Interfaces;
using Aspirra.Domain.Entities;
using Aspirra.Domain.Enums;

namespace Aspirra.Application.Services;

public interface IAuthService
{
    Task<Result<AuthResponse>> RegisterAsync(RegisterRequest request, CancellationToken ct = default);
    Task<Result<AuthResponse>> LoginAsync(LoginRequest request, CancellationToken ct = default);
}

public class AuthService : IAuthService
{
    private readonly IAppDbContext _db;
    private readonly IPasswordHasher _hasher;
    private readonly IJwtTokenService _jwt;

    public AuthService(IAppDbContext db, IPasswordHasher hasher, IJwtTokenService jwt)
    {
        _db = db;
        _hasher = hasher;
        _jwt = jwt;
    }

    public async Task<Result<AuthResponse>> RegisterAsync(RegisterRequest request, CancellationToken ct = default)
    {
        if (request.Role == UserRole.Admin)
            return Result.Failure<AuthResponse>("Admin accounts cannot self-register.", "ADMIN_NOT_ALLOWED");

        var email = request.Email.Trim().ToLowerInvariant();
        var exists = await _db.Users.AnyAsync(u => u.Email == email, ct);
        if (exists)
            return Result.Failure<AuthResponse>("Email is already registered.", "EMAIL_TAKEN");

        var user = new User
        {
            FullName = request.FullName.Trim(),
            Email = email,
            Phone = request.Phone?.Trim(),
            PasswordHash = _hasher.Hash(request.Password),
            Role = request.Role,
            IsActive = true
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync(ct);

        return Result.Success(BuildAuthResponse(user));
    }

    public async Task<Result<AuthResponse>> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email, ct);
        if (user is null || !_hasher.Verify(request.Password, user.PasswordHash))
            return Result.Failure<AuthResponse>("Invalid email or password.", "INVALID_CREDENTIALS");

        if (!user.IsActive)
            return Result.Failure<AuthResponse>("Account is inactive.", "ACCOUNT_INACTIVE");

        return Result.Success(BuildAuthResponse(user));
    }

    private AuthResponse BuildAuthResponse(User user)
    {
        var userDto = new UserDto(user.Id, user.FullName, user.Email, user.Phone, user.Role);
        return new AuthResponse(_jwt.CreateAccessToken(user), _jwt.GetAccessTokenExpiry(), userDto);
    }
}
