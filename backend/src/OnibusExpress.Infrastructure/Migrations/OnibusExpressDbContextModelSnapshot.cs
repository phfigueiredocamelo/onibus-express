using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using OnibusExpress.Infrastructure.Data;
using OnibusExpress.Domain.Enums;

#nullable disable

namespace OnibusExpress.Infrastructure.Migrations;

[DbContext(typeof(OnibusExpressDbContext))]
public partial class OnibusExpressDbContextModelSnapshot : ModelSnapshot
{
    protected override void BuildModel(ModelBuilder modelBuilder)
    {
        modelBuilder.HasAnnotation("ProductVersion", "8.0.0");

        modelBuilder.Entity("OnibusExpress.Domain.Entities.BusRoute", b =>
        {
            b.Property<Guid>("Id");
            b.Property<string>("Destination").IsRequired().HasMaxLength(120);
            b.Property<TimeSpan>("EstimatedDuration").IsRequired();
            b.Property<string>("Origin").IsRequired().HasMaxLength(120);
            b.HasKey("Id");
            b.ToTable("BusRoutes");
        });

        modelBuilder.Entity("OnibusExpress.Domain.Entities.Passenger", b =>
        {
            b.Property<Guid>("Id");
            b.Property<DateOnly?>("BirthDate");
            b.Property<string>("Cpf").IsRequired().HasMaxLength(11);
            b.Property<string>("Email").IsRequired().HasMaxLength(254);
            b.Property<string>("FullName").IsRequired().HasMaxLength(200);
            b.HasKey("Id");
            b.ToTable("Passengers");
        });

        modelBuilder.Entity("OnibusExpress.Domain.Entities.Trip", b =>
        {
            b.Property<Guid>("Id");
            b.Property<decimal>("BasePrice").HasPrecision(18, 2);
            b.Property<DateTimeOffset>("DepartureAt");
            b.Property<Guid>("RouteId");
            b.Property<int>("TotalSeats");
            b.HasKey("Id");
            b.HasIndex("RouteId");
            b.ToTable("Trips");
        });

        modelBuilder.Entity("OnibusExpress.Domain.Entities.Reservation", b =>
        {
            b.Property<Guid>("Id");
            b.Property<DateTimeOffset?>("CancelledAt");
            b.Property<DateTimeOffset>("CreatedAt");
            b.Property<string>("Code").IsRequired().HasMaxLength(64);
            b.Property<Guid>("PassengerId");
            b.Property<int>("SeatNumber");
            b.Property<int>("Status");
            b.Property<Guid>("TripId");
            b.HasKey("Id");
            b.HasIndex("Code").IsUnique();
            b.HasIndex("PassengerId").IsUnique();
            b.HasIndex("TripId", "SeatNumber").IsUnique().HasFilter("\"Status\" = 0");
            b.HasIndex("TripId");
            b.ToTable("Reservations");
        });

        modelBuilder.Entity("OnibusExpress.Domain.Entities.Trip", b =>
        {
            b.HasOne("OnibusExpress.Domain.Entities.BusRoute", "Route")
                .WithMany("Trips")
                .HasForeignKey("RouteId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired();

            b.Navigation("Route");
        });

        modelBuilder.Entity("OnibusExpress.Domain.Entities.Reservation", b =>
        {
            b.HasOne("OnibusExpress.Domain.Entities.Passenger", "Passenger")
                .WithOne()
                .HasForeignKey("OnibusExpress.Domain.Entities.Reservation", "PassengerId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired();

            b.HasOne("OnibusExpress.Domain.Entities.Trip", "Trip")
                .WithMany("Reservations")
                .HasForeignKey("TripId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired();

            b.Navigation("Passenger");
            b.Navigation("Trip");
        });

        modelBuilder.Entity("OnibusExpress.Domain.Entities.BusRoute", b =>
        {
            b.Navigation("Trips");
        });

        modelBuilder.Entity("OnibusExpress.Domain.Entities.Trip", b =>
        {
            b.Navigation("Reservations");
        });
    }
}
