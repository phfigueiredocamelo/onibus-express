namespace OnibusExpress.Application.Abstractions;

public sealed class Result<T>
{
    private Result(bool isSuccess, string? errorCode, T? value)
    {
        IsSuccess = isSuccess;
        ErrorCode = errorCode;
        Value = value;
    }

    public bool IsSuccess { get; }

    public string? ErrorCode { get; }

    public T? Value { get; }

    public static Result<T> Success(T value) => new(true, null, value);

    public static Result<T> Failure(string errorCode) => new(false, errorCode, default);
}
