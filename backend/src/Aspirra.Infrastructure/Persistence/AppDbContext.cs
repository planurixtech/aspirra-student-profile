using Microsoft.EntityFrameworkCore;
using Aspirra.Application.Interfaces;
using Aspirra.Domain.Entities;

namespace Aspirra.Infrastructure.Persistence;

public class AppDbContext : DbContext, IAppDbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<UserProfile> UserProfiles => Set<UserProfile>();
    public DbSet<DashboardState> DashboardStates => Set<DashboardState>();
    public DbSet<WeeklyMinutes> WeeklyMinutes => Set<WeeklyMinutes>();
    public DbSet<TaskItem> TaskItems => Set<TaskItem>();
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        builder.HasDefaultSchema("aspirra");

        builder.Entity<UserProfile>().HasKey(u => u.Id);
        builder.Entity<DashboardState>().HasKey(d => d.Id);
        builder.Entity<WeeklyMinutes>().HasKey(w => w.Day);
        builder.Entity<TaskItem>().HasKey(t => t.Id);
        builder.Entity<User>().HasKey(u => u.Id);

        base.OnModelCreating(builder);
    }
}
