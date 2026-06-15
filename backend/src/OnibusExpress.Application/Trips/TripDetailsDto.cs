using OnibusExpress.Application.Routes;

namespace OnibusExpress.Application.Trips;

public sealed record TripDetailsDto(
    Guid Id,
    RouteSummaryDto Route,
    DateTimeOffset DepartureAt,
    decimal BasePrice,
    int TotalSeats,
    int AvailableSeats,
    IReadOnlyList<TripSeatDto> Seats);
