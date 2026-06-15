using FluentAssertions;
using OnibusExpress.Application.Abstractions;
using OnibusExpress.Application.Reservations;
using OnibusExpress.Domain.Entities;
using OnibusExpress.Domain.Enums;
using Xunit;

namespace OnibusExpress.Tests.Application;

public sealed class ReservationRuleTests
{
    [Fact]
    public async Task CreateReservation_should_block_an_occupied_seat()
    {
        var now = DateTimeOffset.UtcNow;
        var trip = CreateTrip(now.AddDays(1));
        trip.Reservations.Add(new Reservation
        {
            SeatNumber = 12,
            Status = ReservationStatus.Active
        });

        var repository = new FakeReservationRepository(trip, null);
        var service = new CreateReservationService(repository, new FakeReservationCodeGenerator("RSV-0001"));

        var result = await service.CreateAsync(new CreateReservationRequest(
            trip.Id,
            12,
            "Maria Silva",
            "12345678909",
            "maria@example.com",
            null));

        result.IsSuccess.Should().BeFalse();
        result.ErrorCode.Should().Be("seat_occupied");
    }

    [Fact]
    public async Task CreateReservation_should_block_a_trip_that_already_departed()
    {
        var now = DateTimeOffset.UtcNow;
        var trip = CreateTrip(now.AddMinutes(-10));
        var repository = new FakeReservationRepository(trip, null);
        var service = new CreateReservationService(repository, new FakeReservationCodeGenerator("RSV-0001"));

        var result = await service.CreateAsync(new CreateReservationRequest(
            trip.Id,
            3,
            "Maria Silva",
            "12345678909",
            "maria@example.com",
            null));

        result.IsSuccess.Should().BeFalse();
        result.ErrorCode.Should().Be("trip_departed");
    }

    [Fact]
    public async Task CancelReservation_should_block_cancellation_inside_the_two_hour_window()
    {
        var now = DateTimeOffset.UtcNow;
        var trip = CreateTrip(now.AddHours(1));
        var reservation = new Reservation
        {
            Id = Guid.NewGuid(),
            Trip = trip,
            TripId = trip.Id,
            SeatNumber = 8,
            Status = ReservationStatus.Active,
            Code = "RSV-0001",
            CreatedAt = now.AddMinutes(-5),
            Passenger = new Passenger
            {
                FullName = "Maria Silva",
                Cpf = "12345678909",
                Email = "maria@example.com"
            }
        };

        var repository = new FakeReservationRepository(null, reservation);
        var service = new CancelReservationService(repository);

        var result = await service.CancelAsync(reservation.Id);

        result.IsSuccess.Should().BeFalse();
        result.ErrorCode.Should().Be("cancellation_window_closed");
    }

    private static Trip CreateTrip(DateTimeOffset departureAt) =>
        new()
        {
            Id = Guid.NewGuid(),
            DepartureAt = departureAt,
            BasePrice = 120m,
            TotalSeats = 40,
            Route = new BusRoute
            {
                Id = Guid.NewGuid(),
                Origin = "Sao Paulo",
                Destination = "Rio de Janeiro",
                EstimatedDuration = TimeSpan.FromHours(6)
            },
            RouteId = Guid.NewGuid()
        };

    private sealed class FakeReservationRepository : IReservationRepository
    {
        private readonly Trip? _trip;
        private readonly Reservation? _reservation;

        public FakeReservationRepository(Trip? trip, Reservation? reservation)
        {
            _trip = trip;
            _reservation = reservation;
        }

        public Task AddReservationAsync(Reservation reservation, CancellationToken cancellationToken = default)
        {
            return Task.CompletedTask;
        }

        public Task<Reservation?> GetReservationByIdAsync(Guid reservationId, CancellationToken cancellationToken = default)
        {
            return Task.FromResult(_reservation?.Id == reservationId ? _reservation : null);
        }

        public Task<Reservation?> GetReservationByCodeAsync(string code, CancellationToken cancellationToken = default)
        {
            return Task.FromResult(_reservation?.Code == code ? _reservation : null);
        }

        public Task<Trip?> GetTripByIdAsync(Guid tripId, CancellationToken cancellationToken = default)
        {
            return Task.FromResult(_trip?.Id == tripId ? _trip : null);
        }

        public Task UpdateReservationAsync(Reservation reservation, CancellationToken cancellationToken = default)
        {
            return Task.CompletedTask;
        }
    }

    private sealed class FakeReservationCodeGenerator : IReservationCodeGenerator
    {
        private readonly string _code;

        public FakeReservationCodeGenerator(string code)
        {
            _code = code;
        }

        public string Generate() => _code;
    }
}
