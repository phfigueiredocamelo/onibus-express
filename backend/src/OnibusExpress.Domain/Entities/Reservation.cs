namespace OnibusExpress.Domain.Entities;

public sealed class Reservation
{
    public Guid Id { get; init; }

    public Guid TripId { get; init; }

    public Guid PassengerId { get; init; }

    public ReservationStatus Status { get; init; }
}
