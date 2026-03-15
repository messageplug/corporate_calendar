using CalendarApi.DTOs;

namespace CalendarApi.Services;

public interface IAuthService
{
    Task<ApiResponse<AuthResponse>> LoginAsync(LoginRequest request);
    Task<ApiResponse<AuthResponse>> RegisterAsync(RegisterRequest request);
    Task<ApiResponse<object>> LogoutAsync(Guid userId, string refreshToken);
    Task<ApiResponse<AuthResponse>> RefreshTokenAsync(string refreshToken);
    Task<ApiResponse<UserDto>> GetCurrentUserAsync(Guid userId);
}