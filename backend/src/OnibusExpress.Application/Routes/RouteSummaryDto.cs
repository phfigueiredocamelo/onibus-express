namespace OnibusExpress.Application.Routes;

public sealed record RouteSummaryDto(
    Guid Id,
    string Origin,
    string Destination,
    TimeSpan EstimatedDuration);
