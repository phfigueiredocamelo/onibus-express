namespace OnibusExpress.Domain.Entities;

public sealed class BusRoute
{
    public Guid Id { get; init; }

    public string Origin { get; init; } = string.Empty;

    public string Destination { get; init; } = string.Empty;
}
