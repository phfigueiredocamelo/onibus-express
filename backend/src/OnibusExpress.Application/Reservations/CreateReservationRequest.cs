namespace OnibusExpress.Application.Reservations;

public sealed record CreateReservationRequest(
    Guid TripId,
    int SeatNumber,
    string PassengerName,
    string PassengerCpf,
    string PassengerEmail,
    DateOnly? PassengerBirthDate);
