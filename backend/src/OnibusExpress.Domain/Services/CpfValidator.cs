namespace OnibusExpress.Domain.Services;

public static class CpfValidator
{
    public static bool IsValid(string? cpf)
    {
        if (string.IsNullOrWhiteSpace(cpf))
        {
            return false;
        }

        var digits = Normalize(cpf);
        if (digits.Length != 11 || digits.All(ch => ch == digits[0]))
        {
            return false;
        }

        var firstDigit = CalculateCheckDigit(digits.AsSpan(0, 9), 10);
        var secondDigit = CalculateCheckDigit(digits.AsSpan(0, 10), 11);

        return digits[9] == firstDigit && digits[10] == secondDigit;
    }

    private static string Normalize(string cpf)
    {
        var buffer = new char[cpf.Length];
        var length = 0;

        foreach (var character in cpf)
        {
            if (char.IsDigit(character))
            {
                buffer[length++] = character;
                continue;
            }

            if (character is '.' or '-' or ' ')
            {
                continue;
            }

            return string.Empty;
        }

        return new string(buffer, 0, length);
    }

    private static char CalculateCheckDigit(ReadOnlySpan<char> digits, int initialWeight)
    {
        var sum = 0;
        var weight = initialWeight;

        foreach (var digit in digits)
        {
            sum += (digit - '0') * weight;
            weight--;
        }

        var remainder = sum % 11;
        var checkDigit = remainder < 2 ? 0 : 11 - remainder;
        return (char)('0' + checkDigit);
    }
}
