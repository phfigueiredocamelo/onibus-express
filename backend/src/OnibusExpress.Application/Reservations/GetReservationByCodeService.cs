using OnibusExpress.Application.Abstractions;
using OnibusExpress.Domain.Entities;

namespace OnibusExpress.Application.Reservations;

public sealed class GetReservationByCodeService
{
    private readonly IReservationRepository _repository;

    public GetReservationByCodeService(IReservationRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<ReservationDto>> GetAsync(string code, CancellationToken cancellationToken = default)
    {
        var reservation = await _repository.GetReservationByCodeAsync(code, cancellationToken);
        if (reservation is null)
        {
            return Result<ReservationDto>.Failure("reservation_not_found");
        }

        return Result<ReservationDto>.Success(ToDto(reservation));
    }

    private static ReservationDto ToDto(Reservation reservation) =>
        new(
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
                reservation.Passenger.BirthDate));
}
