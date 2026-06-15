using Microsoft.EntityFrameworkCore;
using OnibusExpress.Domain.Entities;
using OnibusExpress.Domain.Enums;

namespace OnibusExpress.Infrastructure.Data;

public static class DemoDataSeeder
{
    public static async Task SeedAsync(OnibusExpressDbContext context, CancellationToken cancellationToken = default)
    {
        if (await context.BusRoutes.AnyAsync(cancellationToken))
        {
            return;
        }

        var route = new BusRoute
        {
            Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            Origin = "Sao Paulo",
            Destination = "Rio de Janeiro",
            EstimatedDuration = TimeSpan.FromHours(6)
        };

        var trip = new Trip
        {
            Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
            Route = route,
            DepartureAt = DateTimeOffset.UtcNow.AddDays(7),
            BasePrice = 120m,
            TotalSeats = 40
        };

        route.Trips.Add(trip);

        trip.Reservations.Add(new Reservation
        {
            Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
            Trip = trip,
            SeatNumber = 1,
            Status = ReservationStatus.Active,
            Code = "RSV-SEED01",
            CreatedAt = DateTimeOffset.UtcNow.AddHours(-2),
            Passenger = new Passenger
            {
                Id = Guid.Parse("44444444-4444-4444-4444-444444444444"),
                FullName = "Joao Silva",
                Cpf = "12345678909",
                Email = "joao@example.com",
                BirthDate = new DateOnly(1990, 1, 1)
            }
        });

        await context.AddAsync(route, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);
    }
}
