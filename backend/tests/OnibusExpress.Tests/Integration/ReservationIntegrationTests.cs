using FluentAssertions;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using OnibusExpress.Application.Reservations;
using OnibusExpress.Domain.Entities;
using OnibusExpress.Domain.Enums;
using OnibusExpress.Infrastructure;
using OnibusExpress.Infrastructure.Data;
using Xunit;

namespace OnibusExpress.Tests.Integration;

public sealed class ReservationIntegrationTests
{
    [Fact]
    public async Task CreateReservation_should_persist_and_reload_by_code_from_the_same_sqlite_store()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();

        var services = new ServiceCollection();
        services.AddInfrastructure(connection);

        await using var provider = services.BuildServiceProvider();
        await using var scope = provider.CreateAsyncScope();

        var context = scope.ServiceProvider.GetRequiredService<OnibusExpressDbContext>();
        await context.Database.EnsureCreatedAsync();

        await DemoDataSeeder.SeedAsync(context);

        var trip = await context.Trips
            .AsNoTracking()
            .Include(t => t.Reservations)
            .SingleAsync();

        trip.Reservations.Should().ContainSingle(r => r.SeatNumber == 1 && r.Status == ReservationStatus.Active);

        var service = new CreateReservationService(
            scope.ServiceProvider.GetRequiredService<OnibusExpress.Application.Abstractions.IReservationRepository>(),
            scope.ServiceProvider.GetRequiredService<OnibusExpress.Application.Abstractions.IReservationCodeGenerator>());

        var result = await service.CreateAsync(new CreateReservationRequest(
            trip.Id,
            7,
            "Maria Silva",
            "12345678909",
            "maria@example.com",
            null));

        result.IsSuccess.Should().BeTrue(result.ErrorCode);
        result.Value.Should().NotBeNull();

        var created = result.Value!;
        created.Code.Should().StartWith("RSV-");

        var reloaded = await context.Reservations
            .AsNoTracking()
            .Include(r => r.Passenger)
            .SingleAsync(r => r.Code == created.Code);

        reloaded.Id.Should().Be(created.Id);
        reloaded.TripId.Should().Be(trip.Id);
        reloaded.SeatNumber.Should().Be(7);
        reloaded.Passenger.FullName.Should().Be("Maria Silva");
        reloaded.Passenger.Cpf.Should().Be("12345678909");
        reloaded.Status.Should().Be(ReservationStatus.Active);
    }
}
