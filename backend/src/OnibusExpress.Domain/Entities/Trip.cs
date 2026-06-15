namespace OnibusExpress.Domain.Entities;

public class Trip
{
    public Guid Id { get; set; }

    public Guid RouteId { get; set; }

    public BusRoute Route { get; set; } = null!;

    public DateTimeOffset DepartureAt { get; set; }

    public decimal BasePrice { get; set; }

    public int TotalSeats { get; set; }

    public List<Reservation> Reservations { get; set; } = [];

    public bool HasDeparted(DateTimeOffset now) => DepartureAt <= now;

    public bool CanCancel(DateTimeOffset now) => DepartureAt > now.AddHours(2);
}
