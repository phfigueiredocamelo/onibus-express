namespace OnibusExpress.Application.Trips;

public enum TripSeatStatus
{
    Available = 0,
    Occupied = 1
}

public sealed record TripSeatDto(int SeatNumber, TripSeatStatus Status);
