using Microsoft.AspNetCore.Mvc;
using Aspirra.Application.DTOs.Auth;
using Aspirra.Application.Services;

namespace Aspirra.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;

    public AuthController(IAuthService auth) => _auth = auth;

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request, CancellationToken ct)
    {
        var result = await _auth.RegisterAsync(request, ct);
        return result.IsSuccess
            ? Ok(result.Value)
            : BadRequest(new { code = result.ErrorCode, message = result.Error });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken ct)
    {
        var result = await _auth.LoginAsync(request, ct);
        return result.IsSuccess
            ? Ok(result.Value)
            : Unauthorized(new { code = result.ErrorCode, message = result.Error });
    }
}


