using CalendarApi.Data;
using CalendarApi.DTOs;
using CalendarApi.Models;
using Microsoft.EntityFrameworkCore;

namespace CalendarApi.Services;

public class UserService : IUserService
{
    private readonly ApplicationDbContext _context;

    public UserService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<List<UserDto>>> GetAllAsync(Guid userId)
    {
        var users = await _context.Users
            .Where(u => u.IsActive)
            .ToListAsync();
        var dtos = users.Select(MapToDto).ToList();
        return new ApiResponse<List<UserDto>>(true, "Успешно", dtos);
    }

    public async Task<ApiResponse<UserDto>> GetByIdAsync(Guid id, Guid userId)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return new ApiResponse<UserDto>(false, "Пользователь не найден");
        return new ApiResponse<UserDto>(true, "Успешно", MapToDto(user));
    }

    public async Task<ApiResponse<UserDto>> UpdateRoleAsync(Guid id, string role, Guid userId)
    {
        var currentUser = await _context.Users.FindAsync(userId);
        if (currentUser == null || currentUser.Role != "ADMIN")
            return new ApiResponse<UserDto>(false, "Только администратор может изменять роли");

        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return new ApiResponse<UserDto>(false, "Пользователь не найден");

        user.Role = role;
        await _context.SaveChangesAsync();

        return new ApiResponse<UserDto>(true, "Роль обновлена", MapToDto(user));
    }

    public async Task<ApiResponse<object>> DeleteAsync(Guid id, Guid userId)
    {
        var currentUser = await _context.Users.FindAsync(userId);
        if (currentUser == null || currentUser.Role != "ADMIN")
            return new ApiResponse<object>(false, "Только администратор может удалять пользователей");

        if (id == userId)
            return new ApiResponse<object>(false, "Нельзя удалить свою учётную запись");

        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return new ApiResponse<object>(false, "Пользователь не найден");

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return new ApiResponse<object>(true, "Пользователь удалён");
    }

    private UserDto MapToDto(User user)
    {
        return new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            Name = user.Name,
            Role = user.Role,
            CreatedAt = user.CreatedAt,
            Avatar = user.Avatar,
            IsActive = user.IsActive
        };
    }
}