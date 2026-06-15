using Microsoft.EntityFrameworkCore;
using OnibusExpress.Application.Abstractions;
using OnibusExpress.Domain.Entities;
using OnibusExpress.Domain.Enums;
using OnibusExpress.Infrastructure.Data;

namespace OnibusExpress.Infrastructure.Trips;

public sealed class EfTripQueryRepository : ITripQueryRepository
{
    private readonly OnibusExpressDbContext _context;

    public EfTripQueryRepository(OnibusExpressDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<BusRoute>> GetRoutesAsync(CancellationToken cancellationToken = default) =>
        await _context.BusRoutes
            .AsNoTracking()
            .OrderBy(route => route.Origin)
            .ThenBy(route => route.Destination)
            .ToListAsync(cancellationToken);

    public Task<Trip?> GetTripByIdAsync(Guid tripId, CancellationToken cancellationToken = default) =>
        _context.Trips
            .AsNoTracking()
            .Include(trip => trip.Route)
            .Include(trip => trip.Reservations)
            .ThenInclude(reservation => reservation.Passenger)
            .SingleOrDefaultAsync(trip => trip.Id == tripId, cancellationToken);

    public async Task<IReadOnlyList<Trip>> SearchTripsAsync(
        string? origin,
        string? destination,
        DateOnly? departureDate,
        DateTimeOffset now,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Trips
            .AsNoTracking()
            .Include(trip => trip.Route)
            .Include(trip => trip.Reservations)
            .ThenInclude(reservation => reservation.Passenger)
            .AsQueryable();

        query = query.Where(trip => trip.DepartureAt >= now);

        if (!string.IsNullOrWhiteSpace(origin))
        {
            var normalizedOrigin = origin.Trim().ToUpper();
            query = query.Where(trip => trip.Route.Origin.ToUpper() == normalizedOrigin);
        }

        if (!string.IsNullOrWhiteSpace(destination))
        {
            var normalizedDestination = destination.Trim().ToUpper();
            query = query.Where(trip => trip.Route.Destination.ToUpper() == normalizedDestination);
        }

        if (departureDate.HasValue)
        {
            var start = new DateTimeOffset(departureDate.Value.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc));
            var end = start.AddDays(1);
            query = query.Where(trip => trip.DepartureAt >= start && trip.DepartureAt < end);
        }

        return await query
            .OrderBy(trip => trip.DepartureAt)
            .ToListAsync(cancellationToken);
    }
}
