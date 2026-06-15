namespace OnibusExpress.Domain.Entities;

public sealed class Passenger
{
    public Guid Id { get; init; }

    public string Name { get; init; } = string.Empty;

    public string Cpf { get; init; } = string.Empty;
}
