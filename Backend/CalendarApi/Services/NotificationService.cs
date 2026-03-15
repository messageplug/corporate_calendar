namespace CalendarApi.Services;

public class NotificationService : INotificationService
{
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(ILogger<NotificationService> logger)
    {
        _logger = logger;
    }

    public Task NotifyNewCommentAsync(Guid eventId, Guid commentId, Guid userId)
    {
        _logger.LogInformation($"Уведомление: новый комментарий {commentId} к событию {eventId} от пользователя {userId}");
        // Здесь можно отправить email, push и т.д.
        return Task.CompletedTask;
    }

    public Task NotifyEventChangedAsync(Guid eventId, Guid changedByUserId)
    {
        _logger.LogInformation($"Уведомление: событие {eventId} изменено пользователем {changedByUserId}");
        return Task.CompletedTask;
    }
}