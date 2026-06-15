namespace OnibusExpress.Application.Trips;

public sealed record TripSearchRequest(string? Origin, string? Destination, DateOnly? DepartureDate);
