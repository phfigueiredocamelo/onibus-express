using OnibusExpress.Application.Abstractions;

namespace OnibusExpress.Infrastructure.Reservations;

public sealed class ReservationCodeGenerator : IReservationCodeGenerator
{
    public string Generate()
    {
        var suffix = Guid.NewGuid().ToString("N")[..10].ToUpperInvariant();
        return $"RSV-{suffix}";
    }
}
