using OnibusExpress.Application.Abstractions;

namespace OnibusExpress.Application.Routes;

public sealed class GetRoutesService
{
    private readonly ITripQueryRepository _repository;

    public GetRoutesService(ITripQueryRepository repository)
    {
        _repository = repository;
    }

    public async Task<IReadOnlyList<RouteSummaryDto>> GetAsync(CancellationToken cancellationToken = default)
    {
        var routes = await _repository.GetRoutesAsync(cancellationToken);

        return routes
            .OrderBy(route => route.Origin)
            .ThenBy(route => route.Destination)
            .Select(route => new RouteSummaryDto(route.Id, route.Origin, route.Destination, route.EstimatedDuration))
            .ToList();
    }
}
