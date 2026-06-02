namespace Aspirra.Domain.Entities;

public class TaskItem
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Time { get; set; } = string.Empty;
    public bool Completed { get; set; }
}
