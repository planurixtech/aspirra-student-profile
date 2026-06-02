using Microsoft.EntityFrameworkCore;
using Aspirra.Domain.Entities;

namespace Aspirra.Application.Interfaces;

public interface IAppDbContext
{
    DbSet<UserProfile> UserProfiles { get; }
    DbSet<DashboardState> DashboardStates { get; }
    DbSet<WeeklyMinutes> WeeklyMinutes { get; }
    DbSet<TaskItem> TaskItems { get; }
    DbSet<User> Users { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
