namespace CalendarApi.Services;

public interface INotificationService
{
    Task NotifyNewCommentAsync(Guid eventId, Guid commentId, Guid userId);
    Task NotifyEventChangedAsync(Guid eventId, Guid changedByUserId);
    // другие методы
}