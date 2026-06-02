using Microsoft.EntityFrameworkCore;
using Aspirra.Application.DTOs;
using Aspirra.Application.Interfaces;
using Aspirra.Domain.Entities;

namespace Aspirra.Application.Services;

public class DashboardService : IDashboardService
{
    private readonly IAppDbContext _context;

    public DashboardService(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardStateDto> GetStateAsync(CancellationToken cancellationToken = default)
    {
        var profile = await GetOrCreateProfileAsync(cancellationToken);
        var settings = await GetOrCreateSettingsAsync(cancellationToken);
        var weeklyMinutesList = await _context.WeeklyMinutes.ToListAsync(cancellationToken);
        var tasks = await _context.TaskItems.ToListAsync(cancellationToken);

        return new DashboardStateDto
        {
            Profile = new UserProfileDto
            {
                Name = profile.Name,
                AvatarLetter = profile.AvatarLetter,
                Group = profile.Group,
                IsVerified = profile.IsVerified
            },
            TargetHours = settings.TargetHours,
            CompletedMinutes = settings.CompletedMinutes,
            Tasks = tasks.Select(t => new TaskItemDto
            {
                Id = t.Id,
                Title = t.Title,
                Time = t.Time,
                Completed = t.Completed
            }).ToList(),
            WeeklyLogs = CalculateWeeklyLogs(settings, weeklyMinutesList)
        };
    }

    public async Task<DashboardStateDto> UpdateTargetHoursAsync(int targetHours, CancellationToken cancellationToken = default)
    {
        var settings = await GetOrCreateSettingsAsync(cancellationToken);
        if (targetHours >= 1 && targetHours <= 24)
        {
            settings.TargetHours = targetHours;
            await _context.SaveChangesAsync(cancellationToken);
        }

        return await GetStateAsync(cancellationToken);
    }

    public async Task<DashboardStateDto> AddStudySessionAsync(int minutes, CancellationToken cancellationToken = default)
    {
        if (minutes > 0)
        {
            var settings = await GetOrCreateSettingsAsync(cancellationToken);
            settings.CompletedMinutes += minutes;

            // Increment logs on the current weekday
            var weekdays = new[] { "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" };
            var currentDay = weekdays[(int)DateTime.Now.DayOfWeek];

            var dayRecord = await _context.WeeklyMinutes
                .FirstOrDefaultAsync(wm => wm.Day == currentDay, cancellationToken);

            if (dayRecord == null)
            {
                dayRecord = new WeeklyMinutes { Day = currentDay, Minutes = minutes };
                _context.WeeklyMinutes.Add(dayRecord);
            }
            else
            {
                dayRecord.Minutes += minutes;
            }

            await _context.SaveChangesAsync(cancellationToken);
        }

        return await GetStateAsync(cancellationToken);
    }

    public async Task<UserProfileDto> UpdateProfileAsync(UserProfileDto profileDto, CancellationToken cancellationToken = default)
    {
        var profile = await GetOrCreateProfileAsync(cancellationToken);
        profile.Name = profileDto.Name;
        profile.AvatarLetter = profileDto.AvatarLetter;
        profile.Group = profileDto.Group;
        profile.IsVerified = profileDto.IsVerified;

        await _context.SaveChangesAsync(cancellationToken);

        return new UserProfileDto
        {
            Name = profile.Name,
            AvatarLetter = profile.AvatarLetter,
            Group = profile.Group,
            IsVerified = profile.IsVerified
        };
    }

    public async Task<List<TaskItemDto>> UpdateTasksAsync(List<TaskItemDto> tasks, CancellationToken cancellationToken = default)
    {
        // Remove existing tasks
        var existingTasks = await _context.TaskItems.ToListAsync(cancellationToken);
        _context.TaskItems.RemoveRange(existingTasks);

        // Add new tasks
        var newTasks = tasks.Select(t => new TaskItem
        {
            Id = t.Id,
            Title = t.Title,
            Time = t.Time,
            Completed = t.Completed
        }).ToList();

        _context.TaskItems.AddRange(newTasks);
        await _context.SaveChangesAsync(cancellationToken);

        return tasks;
    }

    public async Task<DashboardStateDto> ResetStateAsync(CancellationToken cancellationToken = default)
    {
        // Clean all records
        var profiles = await _context.UserProfiles.ToListAsync(cancellationToken);
        _context.UserProfiles.RemoveRange(profiles);

        var settingsList = await _context.DashboardStates.ToListAsync(cancellationToken);
        _context.DashboardStates.RemoveRange(settingsList);

        var weeklyMinutesList = await _context.WeeklyMinutes.ToListAsync(cancellationToken);
        _context.WeeklyMinutes.RemoveRange(weeklyMinutesList);

        var tasks = await _context.TaskItems.ToListAsync(cancellationToken);
        _context.TaskItems.RemoveRange(tasks);

        await _context.SaveChangesAsync(cancellationToken);

        // Reseed to defaults
        var defaultProfile = new UserProfile
        {
            Id = 1,
            Name = "Sangeetha",
            AvatarLetter = "S",
            Group = "TNPSC Group 1 - 2026",
            IsVerified = true
        };
        _context.UserProfiles.Add(defaultProfile);

        var defaultSettings = new DashboardState
        {
            Id = 1,
            TargetHours = 4,
            CompletedMinutes = 60
        };
        _context.DashboardStates.Add(defaultSettings);

        var defaultWeeklyMinutes = new List<WeeklyMinutes>
        {
            new() { Day = "Mon", Minutes = 96 },
            new() { Day = "Tue", Minutes = 48 },
            new() { Day = "Wed", Minutes = 192 },
            new() { Day = "Thu", Minutes = 24 },
            new() { Day = "Fri", Minutes = 120 },
            new() { Day = "Sat", Minutes = 216 },
            new() { Day = "Sun", Minutes = 72 }
        };
        _context.WeeklyMinutes.AddRange(defaultWeeklyMinutes);

        var defaultTasks = new List<TaskItem>
        {
            new() { Id = "task-1", Title = "Historical Theory", Time = "09 : 00 AM", Completed = false },
            new() { Id = "task-2", Title = "Geography Templates", Time = "10 : 00 AM", Completed = true }
        };
        _context.TaskItems.AddRange(defaultTasks);

        await _context.SaveChangesAsync(cancellationToken);

        return await GetStateAsync(cancellationToken);
    }

    private async Task<UserProfile> GetOrCreateProfileAsync(CancellationToken cancellationToken)
    {
        var profile = await _context.UserProfiles.FirstOrDefaultAsync(cancellationToken);
        if (profile == null)
        {
            profile = new UserProfile
            {
                Id = 1,
                Name = "Sangeetha",
                AvatarLetter = "S",
                Group = "TNPSC Group 1 - 2026",
                IsVerified = true
            };
            _context.UserProfiles.Add(profile);
            await _context.SaveChangesAsync(cancellationToken);
        }
        return profile;
    }

    private async Task<DashboardState> GetOrCreateSettingsAsync(CancellationToken cancellationToken)
    {
        var settings = await _context.DashboardStates.FirstOrDefaultAsync(cancellationToken);
        if (settings == null)
        {
            settings = new DashboardState
            {
                Id = 1,
                TargetHours = 4,
                CompletedMinutes = 60
            };
            _context.DashboardStates.Add(settings);
            await _context.SaveChangesAsync(cancellationToken);
        }
        return settings;
    }

    private List<WeeklyLogDto> CalculateWeeklyLogs(DashboardState settings, List<WeeklyMinutes> weeklyMinutesList)
    {
        var weekdays = new[] { "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun" };
        int targetMinutes = settings.TargetHours * 60;
        var logs = new List<WeeklyLogDto>();

        foreach (var day in weekdays)
        {
            var dayRecord = weeklyMinutesList.FirstOrDefault(wm => wm.Day.Equals(day, StringComparison.OrdinalIgnoreCase));
            int minutes = dayRecord?.Minutes ?? 0;
            int percentage = targetMinutes > 0
                ? Math.Min((int)Math.Round((double)minutes / targetMinutes * 100), 100)
                : 0;

            logs.Add(new WeeklyLogDto { Day = day, Percentage = percentage });
        }

        return logs;
    }
}
