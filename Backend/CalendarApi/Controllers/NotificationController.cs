using CalendarApi.DTOs;
using CalendarApi.Services;
using CalendarApi.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CalendarApi.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<NotificationDto>>>> Get([FromQuery] int skip = 0, [FromQuery] int take = 50)
    {
        var userId = User.GetUserId();
        var result = await _notificationService.GetUserNotificationsAsync(userId, skip, take);
        return Ok(result);
    }

    [HttpGet("unread-count")]
    public async Task<ActionResult<ApiResponse<int>>> GetUnreadCount()
    {
        var userId = User.GetUserId();
        var result = await _notificationService.GetUnreadCountAsync(userId);
        return Ok(result);
    }

    [HttpPost("{id}/read")]
    public async Task<ActionResult<ApiResponse<object>>> MarkAsRead(Guid id)
    {
        var userId = User.GetUserId();
        var result = await _notificationService.MarkAsReadAsync(userId, id);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }

    [HttpPost("read-all")]
    public async Task<ActionResult<ApiResponse<object>>> MarkAllAsRead()
    {
        var userId = User.GetUserId();
        var result = await _notificationService.MarkAllAsReadAsync(userId);
        return Ok(result);
    }
}