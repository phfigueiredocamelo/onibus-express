using OnibusExpress.Application.Abstractions;
using OnibusExpress.Domain.Enums;

namespace OnibusExpress.Application.Reservations;

public sealed class CancelReservationService
{
    private readonly IReservationRepository _repository;

    public CancelReservationService(IReservationRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<ReservationDto>> CancelAsync(
        Guid reservationId,
        CancellationToken cancellationToken = default)
    {
        var reservation = await _repository.GetReservationByIdAsync(reservationId, cancellationToken);
        if (reservation is null)
        {
            return Result<ReservationDto>.Failure("reservation_not_found");
        }

        if (reservation.Status == ReservationStatus.Cancelled)
        {
            return Result<ReservationDto>.Failure("reservation_already_cancelled");
        }

        var now = DateTimeOffset.UtcNow;
        if (!reservation.Trip.CanCancel(now))
        {
            return Result<ReservationDto>.Failure("cancellation_window_closed");
        }

        reservation.Status = ReservationStatus.Cancelled;
        reservation.CancelledAt = now;

        await _repository.UpdateReservationAsync(reservation, cancellationToken);

        return Result<ReservationDto>.Success(
            new ReservationDto(
                reservation.Id,
                reservation.TripId,
                reservation.SeatNumber,
                reservation.Status,
                reservation.Code,
                reservation.CreatedAt,
                reservation.CancelledAt,
                new PassengerDto(
                    reservation.Passenger.Id,
                    reservation.Passenger.FullName,
                    reservation.Passenger.Cpf,
                    reservation.Passenger.Email,
                    reservation.Passenger.BirthDate)));
    }
}
