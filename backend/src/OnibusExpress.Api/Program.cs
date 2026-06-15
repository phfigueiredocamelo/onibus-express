using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using OnibusExpress.Application.Reservations;
using OnibusExpress.Application.Routes;
using OnibusExpress.Application.Trips;
using OnibusExpress.Infrastructure;
using OnibusExpress.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy.AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod());
});

builder.Services.AddScoped<GetRoutesService>();
builder.Services.AddScoped<SearchTripsService>();
builder.Services.AddScoped<GetTripByIdService>();
builder.Services.AddScoped<GetReservationByCodeService>();
builder.Services.AddScoped<CancelReservationByCodeService>();
builder.Services.AddScoped<CreateReservationService>();
builder.Services.AddScoped<CancelReservationService>();

var connectionString = builder.Configuration.GetConnectionString("Default") ?? "Data Source=onibusexpress.db";
builder.Services.AddInfrastructure(connectionString);

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<OnibusExpressDbContext>();
    await context.Database.MigrateAsync();
    await DemoDataSeeder.SeedAsync(context);
}

app.UseCors("Frontend");
app.UseSwagger();
app.UseSwaggerUI();

app.MapControllers();
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.Run();

public partial class Program
{
}
