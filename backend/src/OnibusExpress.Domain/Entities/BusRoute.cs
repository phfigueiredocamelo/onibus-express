namespace OnibusExpress.Domain.Entities;

public class BusRoute
{
    public Guid Id { get; set; }

    public string Origin { get; set; } = string.Empty;

    public string Destination { get; set; } = string.Empty;

    public TimeSpan EstimatedDuration { get; set; }

    public List<Trip> Trips { get; set; } = [];
}
