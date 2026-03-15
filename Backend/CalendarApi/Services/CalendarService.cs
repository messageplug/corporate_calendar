using CalendarApi.Data;
using CalendarApi.DTOs;
using CalendarApi.Models;
using Microsoft.EntityFrameworkCore;

namespace CalendarApi.Services;

public class CalendarService : ICalendarService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<CalendarService> _logger;

    public CalendarService(ApplicationDbContext context, ILogger<CalendarService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<ApiResponse<List<CalendarDto>>> GetAllAsync(Guid userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return new ApiResponse<List<CalendarDto>>(false, "Пользователь не найден");

        IQueryable<Calendar> query = _context.Calendars
            .Include(c => c.Members)
            .Include(c => c.Managers);

        if (user.Role != "ADMIN")
        {
            query = query.Where(c => c.Members.Any(m => m.UserId == userId) || c.IsPublic);
        }

        var calendars = await query.ToListAsync();
        var dtos = calendars.Select(MapToDto).ToList();
        return new ApiResponse<List<CalendarDto>>(true, "Успешно", dtos);
    }

    public async Task<ApiResponse<CalendarDto>> GetByIdAsync(Guid id, Guid userId)
    {
        var calendar = await _context.Calendars
            .Include(c => c.Members)
            .Include(c => c.Managers)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (calendar == null)
            return new ApiResponse<CalendarDto>(false, "Календарь не найден");

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return new ApiResponse<CalendarDto>(false, "Пользователь не найден");

        if (user.Role != "ADMIN" && !calendar.Members.Any(m => m.UserId == userId) && !calendar.IsPublic)
            return new ApiResponse<CalendarDto>(false, "Нет доступа к календарю");

        return new ApiResponse<CalendarDto>(true, "Успешно", MapToDto(calendar));
    }

    public async Task<ApiResponse<CalendarDto>> CreateAsync(CalendarCreateDto dto, Guid userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return new ApiResponse<CalendarDto>(false, "Пользователь не найден");

        var calendar = new Calendar
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Description = dto.Description,
            Color = dto.Color,
            CreatedBy = userId,
            CreatedAt = DateTime.UtcNow,
            IsPublic = dto.IsPublic,
            IsArchived = false
        };

        calendar.Members.Add(new CalendarMember { UserId = userId });
        calendar.Managers.Add(new CalendarManager { UserId = userId });

        _context.Calendars.Add(calendar);
        await _context.SaveChangesAsync();

        return new ApiResponse<CalendarDto>(true, "Календарь создан", MapToDto(calendar));
    }

    public async Task<ApiResponse<CalendarDto>> UpdateAsync(Guid id, CalendarUpdateDto dto, Guid userId)
    {
        var calendar = await _context.Calendars
            .Include(c => c.Managers)
            .Include(c => c.Members)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (calendar == null)
            return new ApiResponse<CalendarDto>(false, "Календарь не найден");

        if (!await CanManageCalendar(calendar, userId))
            return new ApiResponse<CalendarDto>(false, "Нет прав на редактирование календаря");

        if (!string.IsNullOrWhiteSpace(dto.Name))
            calendar.Name = dto.Name;
        if (dto.Description != null)
            calendar.Description = dto.Description;
        if (!string.IsNullOrWhiteSpace(dto.Color))
            calendar.Color = dto.Color;
        if (dto.IsPublic.HasValue)
            calendar.IsPublic = dto.IsPublic.Value;

        await _context.SaveChangesAsync();

        return new ApiResponse<CalendarDto>(true, "Календарь обновлен", MapToDto(calendar));
    }

    public async Task<ApiResponse<object>> DeleteAsync(Guid id, Guid userId)
    {
        var calendar = await _context.Calendars.FindAsync(id);
        if (calendar == null)
            return new ApiResponse<object>(false, "Календарь не найден");

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return new ApiResponse<object>(false, "Пользователь не найден");

        if (user.Role != "ADMIN" && calendar.CreatedBy != userId)
            return new ApiResponse<object>(false, "Нет прав на удаление календаря");

        _context.Calendars.Remove(calendar);
        await _context.SaveChangesAsync();

        return new ApiResponse<object>(true, "Календарь удален");
    }

    public async Task<ApiResponse<CalendarDto>> AddMemberAsync(Guid calendarId, Guid memberId, Guid userId)
    {
        var calendar = await _context.Calendars
            .Include(c => c.Members)
            .FirstOrDefaultAsync(c => c.Id == calendarId);
        if (calendar == null)
            return new ApiResponse<CalendarDto>(false, "Календарь не найден");

        if (!await CanManageCalendar(calendar, userId))
            return new ApiResponse<CalendarDto>(false, "Нет прав на добавление участников");

        if (calendar.Members.Any(m => m.UserId == memberId))
            return new ApiResponse<CalendarDto>(false, "Пользователь уже является участником");

        var memberUser = await _context.Users.FindAsync(memberId);
        if (memberUser == null)
            return new ApiResponse<CalendarDto>(false, "Пользователь не найден");

        calendar.Members.Add(new CalendarMember { UserId = memberId });
        await _context.SaveChangesAsync();

        return new ApiResponse<CalendarDto>(true, "Участник добавлен", MapToDto(calendar));
    }

    public async Task<ApiResponse<CalendarDto>> RemoveMemberAsync(Guid calendarId, Guid memberId, Guid userId)
    {
        var calendar = await _context.Calendars
            .Include(c => c.Members)
            .Include(c => c.Managers)
            .FirstOrDefaultAsync(c => c.Id == calendarId);
        if (calendar == null)
            return new ApiResponse<CalendarDto>(false, "Календарь не найден");

        if (!await CanManageCalendar(calendar, userId))
            return new ApiResponse<CalendarDto>(false, "Нет прав на удаление участников");

        if (calendar.CreatedBy == memberId)
            return new ApiResponse<CalendarDto>(false, "Нельзя удалить создателя календаря");

        var member = calendar.Members.FirstOrDefault(m => m.UserId == memberId);
        if (member == null)
            return new ApiResponse<CalendarDto>(false, "Пользователь не является участником");

        calendar.Members.Remove(member);
        var manager = calendar.Managers.FirstOrDefault(m => m.UserId == memberId);
        if (manager != null)
            calendar.Managers.Remove(manager);

        await _context.SaveChangesAsync();

        return new ApiResponse<CalendarDto>(true, "Участник удален", MapToDto(calendar));
    }

    public async Task<ApiResponse<CalendarDto>> AddManagerAsync(Guid calendarId, Guid managerId, Guid userId)
    {
        var calendar = await _context.Calendars
            .Include(c => c.Managers)
            .Include(c => c.Members)
            .FirstOrDefaultAsync(c => c.Id == calendarId);
        if (calendar == null)
            return new ApiResponse<CalendarDto>(false, "Календарь не найден");

        if (!await CanManageCalendar(calendar, userId))
            return new ApiResponse<CalendarDto>(false, "Нет прав на назначение менеджеров");

        var managerUser = await _context.Users.FindAsync(managerId);
        if (managerUser == null)
            return new ApiResponse<CalendarDto>(false, "Пользователь не найден");

        if (managerUser.Role == "MANAGER" || managerUser.Role == "ADMIN")
        {
            return new ApiResponse<CalendarDto>(false,
                "Глобальный менеджер или администратор не может быть назначен менеджером календаря, так как уже имеет соответствующие права");
        }

        if (calendar.Managers.Any(m => m.UserId == managerId))
            return new ApiResponse<CalendarDto>(false, "Пользователь уже является менеджером");

        if (!calendar.Members.Any(m => m.UserId == managerId))
        {
            calendar.Members.Add(new CalendarMember { UserId = managerId });
        }

        calendar.Managers.Add(new CalendarManager { UserId = managerId });
        await _context.SaveChangesAsync();

        return new ApiResponse<CalendarDto>(true, "Менеджер назначен", MapToDto(calendar));
    }

    public async Task<ApiResponse<CalendarDto>> RemoveManagerAsync(Guid calendarId, Guid managerId, Guid userId)
    {
        var calendar = await _context.Calendars
            .Include(c => c.Managers)
            .Include(c => c.Members)
            .FirstOrDefaultAsync(c => c.Id == calendarId);
        if (calendar == null)
            return new ApiResponse<CalendarDto>(false, "Календарь не найден");

        if (!await CanManageCalendar(calendar, userId))
            return new ApiResponse<CalendarDto>(false, "Нет прав на снятие менеджеров");

        if (calendar.CreatedBy == managerId)
            return new ApiResponse<CalendarDto>(false, "Нельзя снять права менеджера с создателя");

        var manager = calendar.Managers.FirstOrDefault(m => m.UserId == managerId);
        if (manager == null)
            return new ApiResponse<CalendarDto>(false, "Пользователь не является менеджером");

        calendar.Managers.Remove(manager);
        await _context.SaveChangesAsync();

        return new ApiResponse<CalendarDto>(true, "Менеджер снят", MapToDto(calendar));
    }

    private async Task<bool> CanManageCalendar(Calendar calendar, Guid userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return false;
        if (user.Role == "ADMIN" || user.Role == "MANAGER") return true;
        if (calendar.CreatedBy == userId) return true;
        return calendar.Managers.Any(m => m.UserId == userId);
    }

    private CalendarDto MapToDto(Calendar calendar)
    {
        return new CalendarDto
        {
            Id = calendar.Id,
            Name = calendar.Name,
            Description = calendar.Description,
            Color = calendar.Color,
            CreatedBy = calendar.CreatedBy,
            CreatedAt = calendar.CreatedAt,
            IsPublic = calendar.IsPublic,
            IsArchived = calendar.IsArchived,
            Members = calendar.Members.Select(m => m.UserId).ToList(),
            Managers = calendar.Managers.Select(m => m.UserId).ToList()
        };
    }
}