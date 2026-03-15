using CalendarApi.DTOs;
using CalendarApi.Services;
using CalendarApi.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CalendarApi.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CommentsController : ControllerBase
{
    private readonly ICommentService _commentService;

    public CommentsController(ICommentService commentService)
    {
        _commentService = commentService;
    }

    [HttpGet("event/{eventId}")]
    public async Task<ActionResult<ApiResponse<List<CommentDto>>>> GetByEvent(Guid eventId)
    {
        var userId = User.GetUserId();
        var result = await _commentService.GetByEventIdAsync(eventId, userId);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<CommentDto>>> Create(CommentCreateDto dto)
    {
        var userId = User.GetUserId();
        var result = await _commentService.CreateAsync(dto, userId);
        if (!result.Success)
            return BadRequest(result);
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<CommentDto>>> Update(Guid id, [FromBody] string content)
    {
        var userId = User.GetUserId();
        var result = await _commentService.UpdateAsync(id, content, userId);
        if (!result.Success && result.Message.Contains("не найден"))
            return NotFound(result);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id)
    {
        var userId = User.GetUserId();
        var result = await _commentService.DeleteAsync(id, userId);
        if (!result.Success && result.Message.Contains("не найден"))
            return NotFound(result);
        return Ok(result);
    }
}