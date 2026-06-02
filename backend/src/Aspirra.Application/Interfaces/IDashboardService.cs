using Aspirra.Application.DTOs;

namespace Aspirra.Application.Interfaces;

public interface IDashboardService
{
    Task<DashboardStateDto> GetStateAsync(CancellationToken cancellationToken = default);
    Task<DashboardStateDto> UpdateTargetHoursAsync(int targetHours, CancellationToken cancellationToken = default);
    Task<DashboardStateDto> AddStudySessionAsync(int minutes, CancellationToken cancellationToken = default);
    Task<UserProfileDto> UpdateProfileAsync(UserProfileDto profileDto, CancellationToken cancellationToken = default);
    Task<List<TaskItemDto>> UpdateTasksAsync(List<TaskItemDto> tasks, CancellationToken cancellationToken = default);
    Task<DashboardStateDto> ResetStateAsync(CancellationToken cancellationToken = default);
}
