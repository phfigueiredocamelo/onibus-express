using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Infrastructure;
using OnibusExpress.Infrastructure.Data;

#nullable disable

namespace OnibusExpress.Infrastructure.Migrations;

[DbContext(typeof(OnibusExpressDbContext))]
[Migration("20260615000000_InitialCreate")]
public partial class InitialCreate : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "BusRoutes",
            columns: table => new
            {
                Id = table.Column<Guid>(nullable: false),
                Origin = table.Column<string>(maxLength: 120, nullable: false),
                Destination = table.Column<string>(maxLength: 120, nullable: false),
                EstimatedDuration = table.Column<TimeSpan>(nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_BusRoutes", x => x.Id);
            });

        migrationBuilder.CreateTable(
            name: "Passengers",
            columns: table => new
            {
                Id = table.Column<Guid>(nullable: false),
                FullName = table.Column<string>(maxLength: 200, nullable: false),
                Cpf = table.Column<string>(maxLength: 11, nullable: false),
                Email = table.Column<string>(maxLength: 254, nullable: false),
                BirthDate = table.Column<DateOnly>(nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Passengers", x => x.Id);
            });

        migrationBuilder.CreateTable(
            name: "Trips",
            columns: table => new
            {
                Id = table.Column<Guid>(nullable: false),
                RouteId = table.Column<Guid>(nullable: false),
                DepartureAt = table.Column<DateTimeOffset>(nullable: false),
                BasePrice = table.Column<decimal>(precision: 18, scale: 2, nullable: false),
                TotalSeats = table.Column<int>(nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Trips", x => x.Id);
                table.ForeignKey(
                    name: "FK_Trips_BusRoutes_RouteId",
                    column: x => x.RouteId,
                    principalTable: "BusRoutes",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "Reservations",
            columns: table => new
            {
                Id = table.Column<Guid>(nullable: false),
                TripId = table.Column<Guid>(nullable: false),
                PassengerId = table.Column<Guid>(nullable: false),
                SeatNumber = table.Column<int>(nullable: false),
                Status = table.Column<int>(nullable: false),
                Code = table.Column<string>(maxLength: 64, nullable: false),
                CreatedAt = table.Column<DateTimeOffset>(nullable: false),
                CancelledAt = table.Column<DateTimeOffset>(nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Reservations", x => x.Id);
                table.ForeignKey(
                    name: "FK_Reservations_Passengers_PassengerId",
                    column: x => x.PassengerId,
                    principalTable: "Passengers",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_Reservations_Trips_TripId",
                    column: x => x.TripId,
                    principalTable: "Trips",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_Reservations_Code",
            table: "Reservations",
            column: "Code",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_Reservations_PassengerId",
            table: "Reservations",
            column: "PassengerId",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_Reservations_TripId_SeatNumber",
            table: "Reservations",
            columns: new[] { "TripId", "SeatNumber" },
            unique: true,
            filter: "\"Status\" = 0");

        migrationBuilder.CreateIndex(
            name: "IX_Reservations_TripId",
            table: "Reservations",
            column: "TripId");

        migrationBuilder.CreateIndex(
            name: "IX_Trips_RouteId",
            table: "Trips",
            column: "RouteId");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "Reservations");
        migrationBuilder.DropTable(name: "Passengers");
        migrationBuilder.DropTable(name: "Trips");
        migrationBuilder.DropTable(name: "BusRoutes");
    }
}
