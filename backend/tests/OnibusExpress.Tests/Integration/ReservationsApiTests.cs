using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using FluentAssertions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using OnibusExpress.Api;
using OnibusExpress.Application.Reservations;
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
        var databasePath = Path.Combine(Path.GetTempPath(), $"onibus-express-{Guid.NewGuid():N}.db");
        var seatNumber = Math.Abs(Guid.NewGuid().GetHashCode());

        try
        {
            await using var factory = new TestApiFactory(databasePath);
            using var client = factory.CreateClient();

            var response = await client.PostAsJsonAsync("/reservas", new CreateReservationRequest(
                Guid.Parse("22222222-2222-2222-2222-222222222222"),
                seatNumber,
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
        finally
        {
            if (File.Exists(databasePath))
            {
                File.Delete(databasePath);
            }
        }
    }

    [Fact]
    public async Task Post_reservas_should_return_bad_request_for_invalid_cpf()
    {
        var databasePath = Path.Combine(Path.GetTempPath(), $"onibus-express-{Guid.NewGuid():N}.db");
        var seatNumber = Math.Abs(Guid.NewGuid().GetHashCode());

        try
        {
            await using var factory = new TestApiFactory(databasePath);
            using var client = factory.CreateClient();

            var response = await client.PostAsJsonAsync("/reservas", new CreateReservationRequest(
                Guid.Parse("22222222-2222-2222-2222-222222222222"),
                seatNumber,
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
        finally
        {
            if (File.Exists(databasePath))
            {
                File.Delete(databasePath);
            }
        }
    }

    private sealed class TestApiFactory : WebApplicationFactory<Program>
    {
        private readonly string _databasePath;

        public TestApiFactory(string databasePath)
        {
            _databasePath = databasePath;
        }

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseEnvironment("Development");
            builder.ConfigureAppConfiguration((_, config) =>
            {
                config.AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["ConnectionStrings:Default"] = $"Data Source={_databasePath}"
                });
            });
        }
    }
}
