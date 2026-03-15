using CalendarApi.DTOs;

namespace CalendarApi.Services;

public interface IUserService
{
    Task<ApiResponse<List<UserDto>>> GetAllAsync(Guid userId);
    Task<ApiResponse<UserDto>> GetByIdAsync(Guid id, Guid userId);
    Task<ApiResponse<UserDto>> UpdateRoleAsync(Guid id, string role, Guid userId);
    Task<ApiResponse<object>> DeleteAsync(Guid id, Guid userId);
}