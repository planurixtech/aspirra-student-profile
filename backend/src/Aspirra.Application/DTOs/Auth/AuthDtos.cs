using Aspirra.Domain.Enums;

namespace Aspirra.Application.DTOs.Auth;

public record RegisterRequest(
    string FullName,
    string Email,
    string Password,
    string? Phone,
    UserRole Role = UserRole.Student);

public record LoginRequest(string Email, string Password);

public record UserDto(
    Guid Id,
    string FullName,
    string Email,
    string? Phone,
    UserRole Role);

public record AuthResponse(
    string AccessToken,
    DateTime ExpiresAt,
    UserDto User);
