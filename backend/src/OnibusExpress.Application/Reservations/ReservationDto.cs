using OnibusExpress.Domain.Enums;

namespace OnibusExpress.Application.Reservations;

public sealed record ReservationDto(
    Guid Id,
    Guid TripId,
    int SeatNumber,
    ReservationStatus Status,
    string Code,
    DateTimeOffset CreatedAt,
    DateTimeOffset? CancelledAt,
    PassengerDto Passenger);

public sealed record PassengerDto(
    Guid Id,
    string FullName,
    string Cpf,
    string Email,
    DateOnly? BirthDate);
