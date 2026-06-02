namespace Aspirra.Domain.Entities;

public class UserProfile
{
    public int Id { get; set; } = 1;
    public string Name { get; set; } = string.Empty;
    public string AvatarLetter { get; set; } = string.Empty;
    public string Group { get; set; } = string.Empty;
    public bool IsVerified { get; set; }
}
