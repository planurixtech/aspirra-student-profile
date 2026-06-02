using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Aspirra.Application;
using Aspirra.Infrastructure;
using Aspirra.Infrastructure.Persistence;
using Aspirra.Domain.Entities;

var builder = WebApplication.CreateBuilder(args);

// Add controllers with camelCase configuration
builder.Services.AddControllers().AddJsonOptions(opts =>
{
    opts.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(opt =>
{
    opt.SwaggerDoc("v1", new OpenApiInfo { Title = "Aspirra API", Version = "v1" });
    opt.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT"
    });
    opt.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme { Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" } },
            Array.Empty<string>()
        }
    });
});

// Configure CORS
const string CorsPolicy = "AspirraCors";
builder.Services.AddCors(options =>
{
    options.AddPolicy(CorsPolicy, policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Register layers
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddApplication();

var app = builder.Build();

// Ensure Database is created and seeded
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await context.Database.EnsureCreatedAsync();

    // Seed User Profile
    if (!await context.UserProfiles.AnyAsync())
    {
        context.UserProfiles.Add(new UserProfile
        {
            Id = 1,
            Name = "Sangeetha",
            AvatarLetter = "S",
            Group = "TNPSC Group 1 - 2026",
            IsVerified = true
        });
    }

    // Seed Dashboard Settings
    if (!await context.DashboardStates.AnyAsync())
    {
        context.DashboardStates.Add(new DashboardState
        {
            Id = 1,
            TargetHours = 4,
            CompletedMinutes = 60
        });
    }

    // Seed Weekly Minutes
    if (!await context.WeeklyMinutes.AnyAsync())
    {
        context.WeeklyMinutes.AddRange(new List<WeeklyMinutes>
        {
            new() { Day = "Mon", Minutes = 96 },
            new() { Day = "Tue", Minutes = 48 },
            new() { Day = "Wed", Minutes = 192 },
            new() { Day = "Thu", Minutes = 24 },
            new() { Day = "Fri", Minutes = 120 },
            new() { Day = "Sat", Minutes = 216 },
            new() { Day = "Sun", Minutes = 72 }
        });
    }

    // Seed Task Items
    if (!await context.TaskItems.AnyAsync())
    {
        context.TaskItems.AddRange(new List<TaskItem>
        {
            new() { Id = "task-1", Title = "Historical Theory", Time = "09 : 00 AM", Completed = false },
            new() { Id = "task-2", Title = "Geography Templates", Time = "10 : 00 AM", Completed = true }
        });
    }

    await context.SaveChangesAsync();
}

app.Use(async (context, next) =>
{
    Console.WriteLine($"[{DateTime.Now:HH:mm:ss}] {context.Request.Method} {context.Request.Path}");
    await next();
});

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(CorsPolicy);

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
