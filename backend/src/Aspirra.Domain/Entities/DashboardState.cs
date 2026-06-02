namespace Aspirra.Domain.Entities;

public class DashboardState
{
    public int Id { get; set; } = 1;
    public int TargetHours { get; set; } = 4;
    public int CompletedMinutes { get; set; } = 60;
}
