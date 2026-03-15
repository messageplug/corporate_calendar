using System.Text.Json.Serialization;

namespace CalendarApi.DTOs;

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }
    public object? Error { get; set; }
    public string Timestamp { get; set; } = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ");

    public ApiResponse() { }

    public ApiResponse(bool success, string message, T? data = default, object? error = null)
    {
        Success = success;
        Message = message;
        Data = data;
        Error = error;
    }
}