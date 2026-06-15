using OnibusExpress.Application.Abstractions;
using OnibusExpress.Application.Routes;
using OnibusExpress.Domain.Enums;

namespace OnibusExpress.Application.Trips;

public sealed class GetTripByIdService
{
    private readonly ITripQueryRepository _repository;

    public GetTripByIdService(ITripQueryRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<TripDetailsDto>> GetAsync(Guid tripId, CancellationToken cancellationToken = default)
    {
        var trip = await _repository.GetTripByIdAsync(tripId, cancellationToken);
        if (trip is null)
        {
            return Result<TripDetailsDto>.Failure("trip_not_found");
        }

        var occupiedSeats = trip.Reservations
            .Where(reservation => reservation.Status == ReservationStatus.Active)
            .Select(reservation => reservation.SeatNumber)
            .ToHashSet();

        var seats = Enumerable.Range(1, trip.TotalSeats)
            .Select(seatNumber => new TripSeatDto(
                seatNumber,
                occupiedSeats.Contains(seatNumber) ? TripSeatStatus.Occupied : TripSeatStatus.Available))
            .ToList();

        var availableSeats = trip.TotalSeats - occupiedSeats.Count;
        return Result<TripDetailsDto>.Success(
            new TripDetailsDto(
                trip.Id,
                new RouteSummaryDto(trip.Route.Id, trip.Route.Origin, trip.Route.Destination, trip.Route.EstimatedDuration),
                trip.DepartureAt,
                trip.BasePrice,
                trip.TotalSeats,
                availableSeats,
                seats));
    }
}
