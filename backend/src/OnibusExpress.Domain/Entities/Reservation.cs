using OnibusExpress.Domain.Enums;

namespace OnibusExpress.Domain.Entities;

public class Reservation
{
    public Guid Id { get; set; }

    public Guid TripId { get; set; }

    public Trip Trip { get; set; } = null!;

    public Passenger Passenger { get; set; } = null!;

    public int SeatNumber { get; set; }

    public ReservationStatus Status { get; set; } = ReservationStatus.Active;

    public string Code { get; set; } = string.Empty;

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset? CancelledAt { get; set; }
}
