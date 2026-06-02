namespace Aspirra.Domain.Entities;

public class WeeklyMinutes
{
    public string Day { get; set; } = string.Empty; // e.g. "Mon", "Tue"
    public int Minutes { get; set; }
}
