using Microsoft.AspNetCore.Mvc;
using OnibusExpress.Api;
using OnibusExpress.Application.Reservations;

namespace OnibusExpress.Api.Controllers;

[ApiController]
[Route("reservas")]
public sealed class ReservationsController : ControllerBase
{
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

        return CreatedAtAction(nameof(GetByCodeAsync), new { codigo = result.Value!.Code }, result.Value);
    }

    [HttpGet("{codigo}")]
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
