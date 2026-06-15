using OnibusExpress.Domain.Entities;

namespace OnibusExpress.Application.Abstractions;

public interface ITripQueryRepository
{
    Task<IReadOnlyList<BusRoute>> GetRoutesAsync(CancellationToken cancellationToken = default);

    Task<Trip?> GetTripByIdAsync(Guid tripId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Trip>> SearchTripsAsync(
        string? origin,
        string? destination,
        DateOnly? departureDate,
        DateTimeOffset now,
        CancellationToken cancellationToken = default);
}
