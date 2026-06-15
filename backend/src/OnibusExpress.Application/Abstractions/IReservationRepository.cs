using OnibusExpress.Domain.Entities;

namespace OnibusExpress.Application.Abstractions;

public interface IReservationRepository
{
    Task<Trip?> GetTripByIdAsync(Guid tripId, CancellationToken cancellationToken = default);

    Task<Reservation?> GetReservationByIdAsync(Guid reservationId, CancellationToken cancellationToken = default);

    Task<Reservation?> GetReservationByCodeAsync(string code, CancellationToken cancellationToken = default);

    Task AddReservationAsync(Reservation reservation, CancellationToken cancellationToken = default);

    Task UpdateReservationAsync(Reservation reservation, CancellationToken cancellationToken = default);
}
