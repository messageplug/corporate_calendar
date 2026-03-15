using CalendarApi.DTOs;
using CalendarApi.Services;
using CalendarApi.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CalendarApi.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class EventsController : ControllerBase
{
    private readonly IEventService _eventService;

    public EventsController(IEventService eventService)
    {
        _eventService = eventService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<EventDto>>>> GetAll([FromQuery] Guid? calendarId)
    {
        var userId = User.GetUserId();
        var result = await _eventService.GetAllAsync(userId, calendarId);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<EventDto>>> GetById(Guid id)
    {
        var userId = User.GetUserId();
        var result = await _eventService.GetByIdAsync(id, userId);
        if (!result.Success && result.Message.Contains("не найден"))
            return NotFound(result);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<EventDto>>> Create(EventCreateDto dto)
    {
        var userId = User.GetUserId();
        var result = await _eventService.CreateAsync(dto, userId);
        if (!result.Success)
            return BadRequest(result);
        return CreatedAtAction(nameof(GetById), new { id = result.Data?.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<EventDto>>> Update(Guid id, EventUpdateDto dto)
    {
        var userId = User.GetUserId();
        var result = await _eventService.UpdateAsync(id, dto, userId);
        if (!result.Success && (result.Message.Contains("не найден") || result.Message.Contains("Нет прав")))
            return NotFound(result);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id)
    {
        var userId = User.GetUserId();
        var result = await _eventService.DeleteAsync(id, userId);
        if (!result.Success && result.Message.Contains("не найден"))
            return NotFound(result);
        return Ok(result);
    }

    [HttpPost("{id}/participants/{participantId}")]
    public async Task<ActionResult<ApiResponse<EventDto>>> AddParticipant(Guid id, Guid participantId)
    {
        var userId = User.GetUserId();
        var result = await _eventService.AddParticipantAsync(id, participantId, userId);
        return Ok(result);
    }

    [HttpDelete("{id}/participants/{participantId}")]
    public async Task<ActionResult<ApiResponse<EventDto>>> RemoveParticipant(Guid id, Guid participantId)
    {
        var userId = User.GetUserId();
        var result = await _eventService.RemoveParticipantAsync(id, participantId, userId);
        return Ok(result);
    }
}