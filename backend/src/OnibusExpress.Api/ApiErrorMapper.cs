using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using OnibusExpress.Application.Abstractions;

namespace OnibusExpress.Api;

public static class ApiErrorMapper
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public static ActionResult<T> ToActionResult<T>(this ControllerBase controller, Result<T> result)
    {
        if (result.IsSuccess)
        {
            return controller.Ok(result.Value);
        }

        var (statusCode, message) = Map(result.ErrorCode);
        var payload = JsonSerializer.Serialize(
            new ApiErrorResponse(result.ErrorCode ?? "erro_desconhecido", message),
            JsonOptions);
        return new ContentResult
        {
            StatusCode = statusCode,
            ContentType = "application/json; charset=utf-8",
            Content = payload
        };
    }

    private static (int StatusCode, string Message) Map(string? errorCode) =>
        errorCode switch
        {
            "trip_not_found" => (StatusCodes.Status404NotFound, "Viagem não encontrada."),
            "trip_departed" => (StatusCodes.Status400BadRequest, "A viagem já partiu."),
            "seat_occupied" => (StatusCodes.Status409Conflict, "O assento informado já está ocupado."),
            "invalid_cpf" => (StatusCodes.Status400BadRequest, "CPF inválido."),
            "reservation_not_found" => (StatusCodes.Status404NotFound, "Reserva não encontrada."),
            "reservation_already_cancelled" => (StatusCodes.Status409Conflict, "A reserva já está cancelada."),
            "cancellation_window_closed" => (StatusCodes.Status400BadRequest, "A janela de cancelamento de duas horas já passou."),
            _ => (StatusCodes.Status400BadRequest, "Não foi possível processar a solicitação.")
        };
}

public sealed record ApiErrorResponse(string Code, string Message);
