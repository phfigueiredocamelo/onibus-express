using Microsoft.AspNetCore.Mvc;
using OnibusExpress.Api;
using OnibusExpress.Application.Trips;

namespace OnibusExpress.Api.Controllers;

[ApiController]
[Route("viagens")]
public sealed class TripsController : ControllerBase
{
    private readonly SearchTripsService _searchService;
    private readonly GetTripByIdService _getTripByIdService;

    public TripsController(SearchTripsService searchService, GetTripByIdService getTripByIdService)
    {
        _searchService = searchService;
        _getTripByIdService = getTripByIdService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<TripSummaryDto>>> SearchAsync(
        [FromQuery(Name = "origem")] string? origin,
        [FromQuery(Name = "destino")] string? destination,
        [FromQuery(Name = "data")] DateOnly? departureDate,
        CancellationToken cancellationToken)
    {
        var trips = await _searchService.SearchAsync(new TripSearchRequest(origin, destination, departureDate), cancellationToken);
        return Ok(trips);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TripDetailsDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var result = await _getTripByIdService.GetAsync(id, cancellationToken);
        return this.ToActionResult(result);
    }
}
