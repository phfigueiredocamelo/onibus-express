using OnibusExpress.Application.Abstractions;
using OnibusExpress.Application.Routes;
using OnibusExpress.Domain.Entities;
using OnibusExpress.Domain.Enums;

namespace OnibusExpress.Application.Trips;

public sealed class SearchTripsService
{
    private readonly ITripQueryRepository _repository;

    public SearchTripsService(ITripQueryRepository repository)
    {
        _repository = repository;
    }

    public async Task<IReadOnlyList<TripSummaryDto>> SearchAsync(
        TripSearchRequest request,
        CancellationToken cancellationToken = default)
    {
        var now = DateTimeOffset.UtcNow;
        var trips = await _repository.SearchTripsAsync(
            request.Origin,
            request.Destination,
            request.DepartureDate,
            now,
            cancellationToken);

        return trips
            .OrderBy(trip => trip.DepartureAt)
            .Select(ToDto)
            .ToList();
    }

    private static TripSummaryDto ToDto(Trip trip)
    {
        var occupiedSeats = trip.Reservations.Count(reservation => reservation.Status == ReservationStatus.Active);
        return new TripSummaryDto(
            trip.Id,
            new RouteSummaryDto(trip.Route.Id, trip.Route.Origin, trip.Route.Destination, trip.Route.EstimatedDuration),
            trip.DepartureAt,
            trip.BasePrice,
            trip.TotalSeats,
            trip.TotalSeats - occupiedSeats);
    }
}
