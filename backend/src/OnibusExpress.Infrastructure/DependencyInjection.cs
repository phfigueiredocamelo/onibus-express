using System.Data.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Data.Sqlite;
using Npgsql;
using OnibusExpress.Application.Abstractions;
using OnibusExpress.Infrastructure.Data;
using OnibusExpress.Infrastructure.Reservations;
using OnibusExpress.Infrastructure.Trips;

namespace OnibusExpress.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, string connectionString)
    {
        services.AddDbContext<OnibusExpressDbContext>(options =>
        {
            if (IsSqliteConnectionString(connectionString))
            {
                options.UseSqlite(connectionString);
                return;
            }

            options.UseNpgsql(connectionString);
        });
        RegisterServices(services);
        return services;
    }

    public static IServiceCollection AddInfrastructure(this IServiceCollection services, DbConnection connection)
    {
        services.AddDbContext<OnibusExpressDbContext>(options =>
        {
            if (connection is SqliteConnection sqliteConnection)
            {
                options.UseSqlite(sqliteConnection);
                return;
            }

            if (connection is NpgsqlConnection npgsqlConnection)
            {
                options.UseNpgsql(npgsqlConnection);
                return;
            }

            throw new NotSupportedException($"Unsupported database connection type: {connection.GetType().FullName}");
        });

        RegisterServices(services);
        return services;
    }

    private static void RegisterServices(IServiceCollection services)
    {
        services.AddScoped<IReservationRepository, EfReservationRepository>();
        services.AddScoped<ITripQueryRepository, EfTripQueryRepository>();
        services.AddSingleton<IReservationCodeGenerator, ReservationCodeGenerator>();
    }

    private static bool IsSqliteConnectionString(string connectionString) =>
        connectionString.StartsWith("Data Source=", StringComparison.OrdinalIgnoreCase) ||
        connectionString.StartsWith("Filename=", StringComparison.OrdinalIgnoreCase) ||
        connectionString.StartsWith("FileName=", StringComparison.OrdinalIgnoreCase);
}
