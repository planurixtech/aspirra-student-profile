using Microsoft.Extensions.DependencyInjection;
using Aspirra.Application.Interfaces;
using Aspirra.Application.Services;

namespace Aspirra.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IDashboardService, DashboardService>();
        services.AddScoped<IAuthService, AuthService>();
        return services;
    }
}
