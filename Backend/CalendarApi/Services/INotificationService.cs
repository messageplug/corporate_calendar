using CalendarApi.DTOs;

namespace CalendarApi.Services;

public interface INotificationService
{
    Task CreateNotificationAsync(Guid userId, string type, string title, string message, Guid? relatedEntityId = null);
    Task<ApiResponse<List<NotificationDto>>> GetUserNotificationsAsync(Guid userId, int skip = 0, int take = 50);
    Task<ApiResponse<int>> GetUnreadCountAsync(Guid userId);
    Task<ApiResponse<object>> MarkAsReadAsync(Guid userId, Guid notificationId);
    Task<ApiResponse<object>> MarkAllAsReadAsync(Guid userId);
}