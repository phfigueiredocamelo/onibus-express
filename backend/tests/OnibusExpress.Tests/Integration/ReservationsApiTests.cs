using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using FluentAssertions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection.Extensions;
using OnibusExpress.Api;
using OnibusExpress.Application.Reservations;
using OnibusExpress.Infrastructure;
using OnibusExpress.Infrastructure.Data;
using Xunit;

namespace OnibusExpress.Tests.Integration;

public sealed class ReservationsApiTests
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter() }
    };

    [Fact]
    public async Task Post_reservas_should_return_created_with_location_for_lookup_by_code()
    {
        await using var factory = new TestApiFactory();
        using var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/reservas", new CreateReservationRequest(
            Guid.Parse("22222222-2222-2222-2222-222222222222"),
            7,
            "Maria Silva",
            "12345678909",
            "maria@example.com",
            null));

        var responseBody = await response.Content.ReadAsStringAsync();
        response.StatusCode.Should().Be(HttpStatusCode.Created, responseBody);

        var payload = await response.Content.ReadFromJsonAsync<ReservationDto>(JsonOptions);
        payload.Should().NotBeNull();
        response.Headers.Location.Should().NotBeNull();
        response.Headers.Location!.ToString().Should().EndWith($"/reservas/{payload!.Code}");
    }

    [Fact]
    public async Task Post_reservas_should_return_bad_request_for_invalid_cpf()
    {
        await using var factory = new TestApiFactory();
        using var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/reservas", new CreateReservationRequest(
            Guid.Parse("22222222-2222-2222-2222-222222222222"),
            7,
            "Maria Silva",
            "123",
            "maria@example.com",
            null));

        var responseBody = await response.Content.ReadAsStringAsync();
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest, responseBody);

        var payload = await response.Content.ReadFromJsonAsync<ApiErrorResponse>();
        payload.Should().NotBeNull();
        payload!.Code.Should().Be("invalid_cpf");
        payload.Message.Should().Be("CPF inválido.");
    }

    [Fact]
    public async Task Post_reservas_should_isolate_state_between_factories()
    {
        const int seatNumber = 7;

        await using var firstFactory = new TestApiFactory();
        using var firstClient = firstFactory.CreateClient();

        var firstResponse = await firstClient.PostAsJsonAsync("/reservas", new CreateReservationRequest(
            Guid.Parse("22222222-2222-2222-2222-222222222222"),
            seatNumber,
            "Maria Silva",
            "12345678909",
            "maria@example.com",
            null));

        var firstBody = await firstResponse.Content.ReadAsStringAsync();
        firstResponse.StatusCode.Should().Be(HttpStatusCode.Created, firstBody);

        await using var secondFactory = new TestApiFactory();
        using var secondClient = secondFactory.CreateClient();

        var secondResponse = await secondClient.PostAsJsonAsync("/reservas", new CreateReservationRequest(
            Guid.Parse("22222222-2222-2222-2222-222222222222"),
            seatNumber,
            "Ana Souza",
            "98765432100",
            "ana@example.com",
            null));

        var secondBody = await secondResponse.Content.ReadAsStringAsync();
        secondResponse.StatusCode.Should().Be(HttpStatusCode.Created, secondBody);
    }

    private sealed class TestApiFactory : WebApplicationFactory<Program>, IAsyncDisposable
    {
        private readonly SqliteConnection _connection = new("Data Source=:memory:");

        public TestApiFactory() => _connection.Open();

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseEnvironment("Development");
            builder.ConfigureServices(services =>
            {
                services.RemoveAll<DbContextOptions<OnibusExpressDbContext>>();
                services.RemoveAll<OnibusExpressDbContext>();
                services.AddInfrastructure(_connection);
            });
        }

        public new async ValueTask DisposeAsync()
        {
            await _connection.DisposeAsync();
            await base.DisposeAsync();
        }
    }
}
