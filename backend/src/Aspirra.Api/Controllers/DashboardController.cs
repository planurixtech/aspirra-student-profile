using Microsoft.AspNetCore.Mvc;
using Aspirra.Application.DTOs;
using Aspirra.Application.Interfaces;

namespace Aspirra.Api.Controllers;

[ApiController]
[Route("api")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("state")]
    public async Task<IActionResult> GetState(CancellationToken cancellationToken)
    {
        var state = await _dashboardService.GetStateAsync(cancellationToken);
        return Ok(state);
    }

    [HttpPost("target-hours")]
    public async Task<IActionResult> UpdateTargetHours([FromBody] UpdateTargetHoursRequest request, CancellationToken cancellationToken)
    {
        var state = await _dashboardService.UpdateTargetHoursAsync(request.TargetHours, cancellationToken);
        return Ok(new
        {
            status = "success",
            targetHours = state.TargetHours,
            weeklyLogs = state.WeeklyLogs
        });
    }

    [HttpPost("study-session")]
    public async Task<IActionResult> AddStudySession([FromBody] AddStudySessionRequest request, CancellationToken cancellationToken)
    {
        var state = await _dashboardService.AddStudySessionAsync(request.Minutes, cancellationToken);
        return Ok(new
        {
            status = "success",
            completedMinutes = state.CompletedMinutes,
            weeklyLogs = state.WeeklyLogs
        });
    }

    [HttpPost("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UserProfileDto request, CancellationToken cancellationToken)
    {
        var profile = await _dashboardService.UpdateProfileAsync(request, cancellationToken);
        return Ok(new
        {
            status = "success",
            profile
        });
    }

    [HttpPost("tasks")]
    public async Task<IActionResult> UpdateTasks([FromBody] UpdateTasksRequest request, CancellationToken cancellationToken)
    {
        var tasks = await _dashboardService.UpdateTasksAsync(request.Tasks, cancellationToken);
        return Ok(new
        {
            status = "success",
            tasks
        });
    }

    [HttpPost("reset")]
    public async Task<IActionResult> Reset(CancellationToken cancellationToken)
    {
        var state = await _dashboardService.ResetStateAsync(cancellationToken);
        return Ok(new
        {
            status = "success",
            profile = state.Profile,
            targetHours = state.TargetHours,
            completedMinutes = state.CompletedMinutes,
            tasks = state.Tasks,
            weeklyLogs = state.WeeklyLogs
        });
    }
}

public class UpdateTargetHoursRequest
{
    public int TargetHours { get; set; }
}

public class AddStudySessionRequest
{
    public int Minutes { get; set; }
}

public class UpdateTasksRequest
{
    public List<TaskItemDto> Tasks { get; set; } = new();
}
