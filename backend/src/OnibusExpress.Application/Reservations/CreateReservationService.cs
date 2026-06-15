using OnibusExpress.Application.Abstractions;
using OnibusExpress.Domain.Entities;
using OnibusExpress.Domain.Enums;
using OnibusExpress.Domain.Services;

namespace OnibusExpress.Application.Reservations;

public sealed class CreateReservationService
{
    private readonly IReservationRepository _repository;
    private readonly IReservationCodeGenerator _codeGenerator;

    public CreateReservationService(IReservationRepository repository, IReservationCodeGenerator codeGenerator)
    {
        _repository = repository;
        _codeGenerator = codeGenerator;
    }

    public async Task<Result<ReservationDto>> CreateAsync(
        CreateReservationRequest request,
        CancellationToken cancellationToken = default)
    {
        var trip = await _repository.GetTripByIdAsync(request.TripId, cancellationToken);
        if (trip is null)
        {
            return Result<ReservationDto>.Failure("trip_not_found");
        }

        var now = DateTimeOffset.UtcNow;
        if (trip.HasDeparted(now))
        {
            return Result<ReservationDto>.Failure("trip_departed");
        }

        if (trip.Reservations.Any(reservation =>
                reservation.Status == ReservationStatus.Active &&
                reservation.SeatNumber == request.SeatNumber))
        {
            return Result<ReservationDto>.Failure("seat_occupied");
        }

        if (!CpfValidator.IsValid(request.PassengerCpf))
        {
            return Result<ReservationDto>.Failure("invalid_cpf");
        }

        var reservation = new Reservation
        {
            Id = Guid.NewGuid(),
            TripId = trip.Id,
            Trip = trip,
            SeatNumber = request.SeatNumber,
            Status = ReservationStatus.Active,
            Code = _codeGenerator.Generate(),
            CreatedAt = now,
            Passenger = new Passenger
            {
                Id = Guid.NewGuid(),
                FullName = request.PassengerName,
                Cpf = request.PassengerCpf,
                Email = request.PassengerEmail,
                BirthDate = request.PassengerBirthDate
            }
        };

        await _repository.AddReservationAsync(reservation, cancellationToken);

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
