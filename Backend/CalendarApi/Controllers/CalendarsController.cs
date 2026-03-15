using CalendarApi.DTOs;
using CalendarApi.Services;
using CalendarApi.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CalendarApi.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CalendarsController : ControllerBase
{
    private readonly ICalendarService _calendarService;

    public CalendarsController(ICalendarService calendarService)
    {
        _calendarService = calendarService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<CalendarDto>>>> GetAll()
    {
        var userId = User.GetUserId();
        var result = await _calendarService.GetAllAsync(userId);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<CalendarDto>>> GetById(Guid id)
    {
        var userId = User.GetUserId();
        var result = await _calendarService.GetByIdAsync(id, userId);
        if (!result.Success && result.Message.Contains("не найден"))
            return NotFound(result);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<CalendarDto>>> Create(CalendarCreateDto dto)
    {
        var userId = User.GetUserId();
        var result = await _calendarService.CreateAsync(dto, userId);
        if (!result.Success)
            return BadRequest(result);
        return CreatedAtAction(nameof(GetById), new { id = result.Data?.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<CalendarDto>>> Update(Guid id, CalendarUpdateDto dto)
    {
        var userId = User.GetUserId();
        var result = await _calendarService.UpdateAsync(id, dto, userId);
        if (!result.Success && (result.Message.Contains("не найден") || result.Message.Contains("Нет прав")))
            return NotFound(result);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id)
    {
        var userId = User.GetUserId();
        var result = await _calendarService.DeleteAsync(id, userId);
        if (!result.Success && result.Message.Contains("не найден"))
            return NotFound(result);
        return Ok(result);
    }

    [HttpPost("{id}/members/{memberId}")]
    public async Task<ActionResult<ApiResponse<CalendarDto>>> AddMember(Guid id, Guid memberId)
    {
        var userId = User.GetUserId();
        var result = await _calendarService.AddMemberAsync(id, memberId, userId);
        if (!result.Success)
            return BadRequest(result);
        return Ok(result);
    }

    [HttpDelete("{id}/members/{memberId}")]
    public async Task<ActionResult<ApiResponse<CalendarDto>>> RemoveMember(Guid id, Guid memberId)
    {
        var userId = User.GetUserId();
        var result = await _calendarService.RemoveMemberAsync(id, memberId, userId);
        if (!result.Success)
            return BadRequest(result);
        return Ok(result);
    }

    [HttpPost("{id}/managers/{managerId}")]
    public async Task<ActionResult<ApiResponse<CalendarDto>>> AddManager(Guid id, Guid managerId)
    {
        var userId = User.GetUserId();
        var result = await _calendarService.AddManagerAsync(id, managerId, userId);
        if (!result.Success)
            return BadRequest(result);
        return Ok(result);
    }

    [HttpDelete("{id}/managers/{managerId}")]
    public async Task<ActionResult<ApiResponse<CalendarDto>>> RemoveManager(Guid id, Guid managerId)
    {
        var userId = User.GetUserId();
        var result = await _calendarService.RemoveManagerAsync(id, managerId, userId);
        if (!result.Success)
            return BadRequest(result);
        return Ok(result);
    }
}