using Microsoft.AspNetCore.Mvc;
using OnibusExpress.Api;
using OnibusExpress.Application.Reservations;

namespace OnibusExpress.Api.Controllers;

[ApiController]
[Route("reservas")]
public sealed class ReservationsController : ControllerBase
{
    private const string GetReservationByCodeRouteName = "GetReservationByCode";

    private readonly CreateReservationService _createService;
    private readonly GetReservationByCodeService _getByCodeService;
    private readonly CancelReservationByCodeService _cancelByCodeService;

    public ReservationsController(
        CreateReservationService createService,
        GetReservationByCodeService getByCodeService,
        CancelReservationByCodeService cancelByCodeService)
    {
        _createService = createService;
        _getByCodeService = getByCodeService;
        _cancelByCodeService = cancelByCodeService;
    }

    [HttpPost]
    public async Task<ActionResult<ReservationDto>> CreateAsync(
        [FromBody] CreateReservationRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _createService.CreateAsync(request, cancellationToken);
        if (!result.IsSuccess)
        {
            return this.ToActionResult(result);
        }

        var reservation = result.Value!;
        var location = Url.RouteUrl(GetReservationByCodeRouteName, new { codigo = reservation.Code });

        if (!string.IsNullOrWhiteSpace(location))
        {
            Response.Headers.Location = location;
        }

        return ApiErrorMapper.CreateJsonContentResult(StatusCodes.Status201Created, reservation);
    }

    [HttpGet("{codigo}", Name = GetReservationByCodeRouteName)]
    public async Task<ActionResult<ReservationDto>> GetByCodeAsync(string codigo, CancellationToken cancellationToken)
    {
        var result = await _getByCodeService.GetAsync(codigo, cancellationToken);
        return this.ToActionResult(result);
    }

    [HttpDelete("{codigo}")]
    public async Task<ActionResult<ReservationDto>> CancelAsync(string codigo, CancellationToken cancellationToken)
    {
        var result = await _cancelByCodeService.CancelAsync(codigo, cancellationToken);
        return this.ToActionResult(result);
    }
}
