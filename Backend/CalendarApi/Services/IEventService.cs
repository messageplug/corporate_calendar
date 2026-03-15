using CalendarApi.DTOs;

namespace CalendarApi.Services;

public interface IEventService
{
    Task<ApiResponse<List<EventDto>>> GetAllAsync(Guid userId, Guid? calendarId = null);
    Task<ApiResponse<EventDto>> GetByIdAsync(Guid id, Guid userId);
    Task<ApiResponse<EventDto>> CreateAsync(EventCreateDto dto, Guid userId);
    Task<ApiResponse<EventDto>> UpdateAsync(Guid id, EventUpdateDto dto, Guid userId);
    Task<ApiResponse<object>> DeleteAsync(Guid id, Guid userId);
    Task<ApiResponse<EventDto>> AddParticipantAsync(Guid eventId, Guid participantId, Guid userId);
    Task<ApiResponse<EventDto>> RemoveParticipantAsync(Guid eventId, Guid participantId, Guid userId);
}