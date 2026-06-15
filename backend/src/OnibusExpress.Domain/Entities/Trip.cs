namespace OnibusExpress.Domain.Entities;

public sealed class Trip
{
    public Guid Id { get; init; }

    public Guid BusRouteId { get; init; }

    public DateTime DepartureAt { get; init; }

    public decimal Price { get; init; }
}
