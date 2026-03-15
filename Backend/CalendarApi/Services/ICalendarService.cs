using CalendarApi.DTOs;

namespace CalendarApi.Services;

public interface ICalendarService
{
    Task<ApiResponse<List<CalendarDto>>> GetAllAsync(Guid userId);
    Task<ApiResponse<CalendarDto>> GetByIdAsync(Guid id, Guid userId);
    Task<ApiResponse<CalendarDto>> CreateAsync(CalendarCreateDto dto, Guid userId);
    Task<ApiResponse<CalendarDto>> UpdateAsync(Guid id, CalendarUpdateDto dto, Guid userId);
    Task<ApiResponse<object>> DeleteAsync(Guid id, Guid userId);
    Task<ApiResponse<CalendarDto>> AddMemberAsync(Guid calendarId, Guid memberId, Guid userId);
    Task<ApiResponse<CalendarDto>> RemoveMemberAsync(Guid calendarId, Guid memberId, Guid userId);
    Task<ApiResponse<CalendarDto>> AddManagerAsync(Guid calendarId, Guid managerId, Guid userId);
    Task<ApiResponse<CalendarDto>> RemoveManagerAsync(Guid calendarId, Guid managerId, Guid userId);
}