using Microsoft.EntityFrameworkCore;
using OnibusExpress.Application.Abstractions;
using OnibusExpress.Domain.Entities;
using OnibusExpress.Infrastructure.Data;

namespace OnibusExpress.Infrastructure.Reservations;

public sealed class EfReservationRepository : IReservationRepository
{
    private readonly OnibusExpressDbContext _context;

    public EfReservationRepository(OnibusExpressDbContext context)
    {
        _context = context;
    }

    public Task<Trip?> GetTripByIdAsync(Guid tripId, CancellationToken cancellationToken = default) =>
        _context.Trips
            .Include(trip => trip.Reservations)
            .ThenInclude(reservation => reservation.Passenger)
            .SingleOrDefaultAsync(trip => trip.Id == tripId, cancellationToken);

    public Task<Reservation?> GetReservationByIdAsync(Guid reservationId, CancellationToken cancellationToken = default) =>
        _context.Reservations
            .Include(reservation => reservation.Trip)
            .Include(reservation => reservation.Passenger)
            .SingleOrDefaultAsync(reservation => reservation.Id == reservationId, cancellationToken);

    public async Task AddReservationAsync(Reservation reservation, CancellationToken cancellationToken = default)
    {
        await _context.Reservations.AddAsync(reservation, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateReservationAsync(Reservation reservation, CancellationToken cancellationToken = default)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }
}
