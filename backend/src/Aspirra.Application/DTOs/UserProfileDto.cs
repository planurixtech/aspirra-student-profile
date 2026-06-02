namespace Aspirra.Application.DTOs;

public class UserProfileDto
{
    public string Name { get; set; } = string.Empty;
    public string AvatarLetter { get; set; } = string.Empty;
    public string Group { get; set; } = string.Empty;
    public bool IsVerified { get; set; }
}
