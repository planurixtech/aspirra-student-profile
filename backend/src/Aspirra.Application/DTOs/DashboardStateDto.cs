namespace Aspirra.Application.DTOs;

public class DashboardStateDto
{
    public UserProfileDto Profile { get; set; } = new();
    public int TargetHours { get; set; }
    public int CompletedMinutes { get; set; }
    public List<TaskItemDto> Tasks { get; set; } = new();
    public List<WeeklyLogDto> WeeklyLogs { get; set; } = new();
}
