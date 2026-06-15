namespace OnibusExpress.Domain.Entities;

public class Passenger
{
    public Guid Id { get; set; }

    public string FullName { get; set; } = string.Empty;

    public string Cpf { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public DateOnly? BirthDate { get; set; }
}
