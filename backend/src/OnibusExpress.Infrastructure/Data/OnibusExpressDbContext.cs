using Microsoft.EntityFrameworkCore;
using OnibusExpress.Domain.Entities;
using OnibusExpress.Domain.Enums;

namespace OnibusExpress.Infrastructure.Data;

public sealed class OnibusExpressDbContext : DbContext
{
    public OnibusExpressDbContext(DbContextOptions<OnibusExpressDbContext> options)
        : base(options)
    {
    }

    public DbSet<BusRoute> BusRoutes => Set<BusRoute>();

    public DbSet<Trip> Trips => Set<Trip>();

    public DbSet<Reservation> Reservations => Set<Reservation>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<BusRoute>(entity =>
        {
            entity.ToTable("BusRoutes");
            entity.HasKey(route => route.Id);
            entity.Property(route => route.Origin).IsRequired().HasMaxLength(120);
            entity.Property(route => route.Destination).IsRequired().HasMaxLength(120);
            entity.Property(route => route.EstimatedDuration).IsRequired();
        });

        modelBuilder.Entity<Trip>(entity =>
        {
            entity.ToTable("Trips");
            entity.HasKey(trip => trip.Id);
            entity.Property(trip => trip.DepartureAt).IsRequired();
            entity.Property(trip => trip.BasePrice).HasPrecision(18, 2);
            entity.Property(trip => trip.TotalSeats).IsRequired();

            entity.HasOne(trip => trip.Route)
                .WithMany(route => route.Trips)
                .HasForeignKey(trip => trip.RouteId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Reservation>(entity =>
        {
            entity.ToTable("Reservations");
            entity.HasKey(reservation => reservation.Id);
            entity.Property(reservation => reservation.SeatNumber).IsRequired();
            entity.Property(reservation => reservation.Code).IsRequired().HasMaxLength(64);
            entity.Property(reservation => reservation.CreatedAt).IsRequired();
            entity.Property(reservation => reservation.CancelledAt);
            entity.Property(reservation => reservation.Status)
                .HasConversion<int>()
                .IsRequired();

            entity.HasIndex(reservation => reservation.Code).IsUnique();
            entity.HasIndex(reservation => new { reservation.TripId, reservation.SeatNumber })
                .IsUnique()
                .HasFilter($"\"{nameof(Reservation.Status)}\" = {(int)ReservationStatus.Active}");

            entity.HasOne(reservation => reservation.Trip)
                .WithMany(trip => trip.Reservations)
                .HasForeignKey(reservation => reservation.TripId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(reservation => reservation.Passenger)
                .WithOne()
                .HasForeignKey<Reservation>("PassengerId")
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Passenger>(entity =>
        {
            entity.ToTable("Passengers");
            entity.HasKey(passenger => passenger.Id);
            entity.Property(passenger => passenger.FullName).IsRequired().HasMaxLength(200);
            entity.Property(passenger => passenger.Cpf).IsRequired().HasMaxLength(11);
            entity.Property(passenger => passenger.Email).IsRequired().HasMaxLength(254);
            entity.Property(passenger => passenger.BirthDate);
        });
    }
}
