using FluentAssertions;
using OnibusExpress.Domain.Services;
using Xunit;

namespace OnibusExpress.Tests.Domain;

public sealed class CpfValidatorTests
{
    [Theory]
    [InlineData("12345678909")]
    [InlineData("123.456.789-09")]
    public void IsValid_should_accept_valid_cpf_values_with_or_without_formatting(string cpf)
    {
        var result = CpfValidator.IsValid(cpf);

        result.Should().BeTrue();
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("123")]
    [InlineData("123.456.789-00")]
    [InlineData("111.111.111-11")]
    [InlineData("123.456.789-0A")]
    public void IsValid_should_reject_invalid_cpf_values(string? cpf)
    {
        var result = CpfValidator.IsValid(cpf);

        result.Should().BeFalse();
    }
}
