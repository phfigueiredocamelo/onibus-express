using OnibusExpress.Application.Routes;

namespace OnibusExpress.Application.Trips;

public sealed record TripSummaryDto(
    Guid Id,
    RouteSummaryDto Route,
    DateTimeOffset DepartureAt,
    decimal BasePrice,
    int TotalSeats,
    int AvailableSeats);
