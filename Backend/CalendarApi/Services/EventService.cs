using CalendarApi.Data;
using CalendarApi.DTOs;
using CalendarApi.Models;
using Microsoft.EntityFrameworkCore;

namespace CalendarApi.Services;

public class EventService : IEventService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<EventService> _logger;
    private readonly INotificationService _notificationService;
    public EventService(ApplicationDbContext context, ILogger<EventService> logger, INotificationService notificationService)
    {
        _context = context;
        _logger = logger;
        _notificationService = notificationService;
    }

    public async Task<ApiResponse<List<EventDto>>> GetAllAsync(Guid userId, Guid? calendarId = null)
    {
        var query = _context.Events
            .Include(e => e.Participants)
            .Include(e => e.Calendar)
            .AsQueryable();

        if (calendarId.HasValue)
            query = query.Where(e => e.CalendarId == calendarId.Value);

        var events = await query.ToListAsync();
        var dtos = events.Select(MapToDto).ToList();
        return new ApiResponse<List<EventDto>>(true, "Успешно", dtos);
    }

    public async Task<ApiResponse<EventDto>> GetByIdAsync(Guid id, Guid userId)
    {
        var ev = await _context.Events
            .Include(e => e.Participants)
            .Include(e => e.Calendar)
            .FirstOrDefaultAsync(e => e.Id == id);
        if (ev == null)
            return new ApiResponse<EventDto>(false, "Событие не найдено");

        return new ApiResponse<EventDto>(true, "Успешно", MapToDto(ev));
    }

    public async Task<ApiResponse<EventDto>> CreateAsync(EventCreateDto dto, Guid userId)
    {
        var ev = new Event
        {
            Id = Guid.NewGuid(),
            Title = dto.Title,
            Description = dto.Description,
            Start = dto.Start,
            End = dto.End,
            CalendarId = dto.CalendarId,
            CreatedBy = userId,
            CreatedAt = DateTime.UtcNow,
            Location = dto.Location,
            Color = dto.Color,
            Status = "SCHEDULED"
        };

        ev.Participants.Add(new EventParticipant { UserId = userId });
        foreach (var p in dto.Participants)
        {
            if (p != userId)
                ev.Participants.Add(new EventParticipant { UserId = p });
        }

        _context.Events.Add(ev);
        await _context.SaveChangesAsync();

        return new ApiResponse<EventDto>(true, "Событие создано", MapToDto(ev));
    }

    public async Task<ApiResponse<EventDto>> UpdateAsync(Guid id, EventUpdateDto dto, Guid userId)
    {
        var ev = await _context.Events
            .Include(e => e.Participants)
            .FirstOrDefaultAsync(e => e.Id == id);
        if (ev == null)
            return new ApiResponse<EventDto>(false, "Событие не найдено");

        if (!await CanEditEvent(ev, userId))
            return new ApiResponse<EventDto>(false, "Нет прав на редактирование события");

        if (!string.IsNullOrWhiteSpace(dto.Title))
            ev.Title = dto.Title;
        if (dto.Description != null)
            ev.Description = dto.Description;
        if (dto.Start.HasValue)
            ev.Start = dto.Start.Value;
        if (dto.End.HasValue)
            ev.End = dto.End.Value;
        if (dto.Location != null)
            ev.Location = dto.Location;
        if (dto.Color != null)
            ev.Color = dto.Color;
        if (dto.Status != null)
            ev.Status = dto.Status;

        if (dto.Participants != null)
        {
            _context.EventParticipants.RemoveRange(ev.Participants);
            ev.Participants.Clear();
            foreach (var p in dto.Participants.Distinct())
            {
                ev.Participants.Add(new EventParticipant { UserId = p });
            }
            if (!ev.Participants.Any(p => p.UserId == ev.CreatedBy))
                ev.Participants.Add(new EventParticipant { UserId = ev.CreatedBy });
        }

        await _context.SaveChangesAsync();

        var eventParticipants = ev.Participants.Select(p => p.UserId).Where(uid => uid != userId).Distinct();
        foreach (var pid in eventParticipants)
        {
            await _notificationService.CreateNotificationAsync(
                pid,
                "event_changed",
                "Событие изменено",
                $"Событие \"{ev.Title}\" было изменено",
                ev.Id
            );
        }

        return new ApiResponse<EventDto>(true, "Событие обновлено", MapToDto(ev));
    }

    public async Task<ApiResponse<object>> DeleteAsync(Guid id, Guid userId)
    {
        var ev = await _context.Events.FindAsync(id);
        if (ev == null)
            return new ApiResponse<object>(false, "Событие не найдено");

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return new ApiResponse<object>(false, "Пользователь не найден");

        var calendar = await _context.Calendars
            .Include(c => c.Managers)
            .FirstOrDefaultAsync(c => c.Id == ev.CalendarId);
        if (calendar == null)
            return new ApiResponse<object>(false, "Календарь не найден");

        if (user.Role != "ADMIN" && ev.CreatedBy != userId && !calendar.Managers.Any(m => m.UserId == userId))
            return new ApiResponse<object>(false, "Нет прав на удаление события");

        _context.Events.Remove(ev);
        await _context.SaveChangesAsync();

        return new ApiResponse<object>(true, "Событие удалено");
    }

    public async Task<ApiResponse<EventDto>> AddParticipantAsync(Guid eventId, Guid participantId, Guid userId)
    {
        var ev = await _context.Events
            .Include(e => e.Participants)
            .Include(e => e.Calendar)
            .FirstOrDefaultAsync(e => e.Id == eventId);
        if (ev == null)
            return new ApiResponse<EventDto>(false, "Событие не найдено");

        if (!await CanEditEvent(ev, userId) && ev.CreatedBy != userId)
            return new ApiResponse<EventDto>(false, "Нет прав для добавления участников");

        if (ev.Participants.Any(p => p.UserId == participantId))
            return new ApiResponse<EventDto>(false, "Пользователь уже участвует в событии");

        ev.Participants.Add(new EventParticipant { UserId = participantId });
        await _context.SaveChangesAsync();

        // Уведомление добавленному участнику
        await _notificationService.CreateNotificationAsync(
            participantId,
            "participant_added",
            "Вы добавлены в событие",
            $"Вас добавили в событие \"{ev.Title}\"",
            ev.Id
        );

        return new ApiResponse<EventDto>(true, "Участник добавлен", MapToDto(ev));
    }

    public async Task<ApiResponse<EventDto>> RemoveParticipantAsync(Guid eventId, Guid participantId, Guid userId)
    {
        var ev = await _context.Events
            .Include(e => e.Participants)
            .FirstOrDefaultAsync(e => e.Id == eventId);
        if (ev == null)
            return new ApiResponse<EventDto>(false, "Событие не найдено");

        if (!await CanEditEvent(ev, userId) && ev.CreatedBy != userId && userId != participantId)
            return new ApiResponse<EventDto>(false, "Нет прав для удаления участника");

        var participant = ev.Participants.FirstOrDefault(p => p.UserId == participantId);
        if (participant == null)
            return new ApiResponse<EventDto>(false, "Пользователь не является участником");

        ev.Participants.Remove(participant);
        await _context.SaveChangesAsync();
        return new ApiResponse<EventDto>(true, "Участник удалён", MapToDto(ev));
    }

    private async Task<bool> CanEditEvent(Event ev, Guid userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return false;
        if (user.Role == "ADMIN") return true;
        if (ev.CreatedBy == userId) return true;
        var calendar = await _context.Calendars.FindAsync(ev.CalendarId);
        return calendar != null && calendar.Managers.Any(m => m.UserId == userId);
    }

    private EventDto MapToDto(Event ev)
    {
        return new EventDto
        {
            Id = ev.Id,
            Title = ev.Title,
            Description = ev.Description,
            Start = ev.Start,
            End = ev.End,
            CalendarId = ev.CalendarId,
            CreatedBy = ev.CreatedBy,
            CreatedAt = ev.CreatedAt,
            Location = ev.Location,
            Color = ev.Color,
            Status = ev.Status,
            Participants = ev.Participants.Select(p => p.UserId).ToList()
        };
    }
}