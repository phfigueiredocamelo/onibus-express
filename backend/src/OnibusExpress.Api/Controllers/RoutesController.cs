using Microsoft.AspNetCore.Mvc;
using OnibusExpress.Api;
using OnibusExpress.Application.Routes;

namespace OnibusExpress.Api.Controllers;

[ApiController]
[Route("rotas")]
public sealed class RoutesController : ControllerBase
{
    private readonly GetRoutesService _service;

    public RoutesController(GetRoutesService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<RouteSummaryDto>>> GetAsync(CancellationToken cancellationToken)
    {
        var routes = await _service.GetAsync(cancellationToken);
        return Ok(routes);
    }
}
