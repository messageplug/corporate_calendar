using CalendarApi.Data;
using CalendarApi.DTOs;
using CalendarApi.Models;
using Microsoft.EntityFrameworkCore;

namespace CalendarApi.Services;

public class CommentService : ICommentService
{
    private readonly ApplicationDbContext _context;
    private readonly INotificationService _notificationService;

    public CommentService(ApplicationDbContext context, INotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }

    public async Task<ApiResponse<List<CommentDto>>> GetByEventIdAsync(Guid eventId, Guid userId)
    {
        var comments = await _context.Comments
            .Include(c => c.User)
            .Where(c => c.EventId == eventId)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        var dtos = comments.Select(c => new CommentDto
        {
            Id = c.Id,
            EventId = c.EventId,
            UserId = c.UserId,
            Content = c.Content,
            CreatedAt = c.CreatedAt,
            UpdatedAt = c.UpdatedAt,
            UserName = c.User?.Name ?? "Неизвестный пользователь"
        }).ToList();

        return new ApiResponse<List<CommentDto>>(true, "Успешно", dtos);
    }

    public async Task<ApiResponse<CommentDto>> CreateAsync(CommentCreateDto dto, Guid userId)
    {
        var comment = new Comment
        {
            Id = Guid.NewGuid(),
            EventId = dto.EventId,
            UserId = userId,
            Content = dto.Content,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();

        var user = await _context.Users.FindAsync(userId);

        var eventEntity = await _context.Events
            .Include(e => e.Participants)
            .FirstOrDefaultAsync(e => e.Id == dto.EventId);
        if (eventEntity != null)
        {
            var participantIds = eventEntity.Participants.Select(p => p.UserId).Where(uid => uid != userId).Distinct();
            foreach (var pid in participantIds)
            {
                await _notificationService.CreateNotificationAsync(
                    pid,
                    "comment",
                    "Новый комментарий",
                    $"Пользователь {user?.Name} оставил комментарий к событию \"{eventEntity.Title}\"",
                    eventEntity.Id
                );
            }
        }

        return new ApiResponse<CommentDto>(true, "Комментарий добавлен", new CommentDto
        {
            Id = comment.Id,
            EventId = comment.EventId,
            UserId = comment.UserId,
            Content = comment.Content,
            CreatedAt = comment.CreatedAt,
            UpdatedAt = comment.UpdatedAt,
            UserName = user?.Name ?? "Неизвестный пользователь"
        });
    }

    public async Task<ApiResponse<CommentDto>> UpdateAsync(Guid id, string content, Guid userId)
    {
        var comment = await _context.Comments.FindAsync(id);
        if (comment == null)
            return new ApiResponse<CommentDto>(false, "Комментарий не найден");

        if (comment.UserId != userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null || user.Role != "ADMIN")
                return new ApiResponse<CommentDto>(false, "Нет прав на редактирование комментария");
        }

        comment.Content = content;
        comment.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        var commentUser = await _context.Users.FindAsync(comment.UserId);

        return new ApiResponse<CommentDto>(true, "Комментарий обновлен", new CommentDto
        {
            Id = comment.Id,
            EventId = comment.EventId,
            UserId = comment.UserId,
            Content = comment.Content,
            CreatedAt = comment.CreatedAt,
            UpdatedAt = comment.UpdatedAt,
            UserName = commentUser?.Name ?? "Неизвестный пользователь"
        });
    }

    public async Task<ApiResponse<object>> DeleteAsync(Guid id, Guid userId)
    {
        var comment = await _context.Comments.FindAsync(id);
        if (comment == null)
            return new ApiResponse<object>(false, "Комментарий не найден");

        if (comment.UserId != userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null || user.Role != "ADMIN")
                return new ApiResponse<object>(false, "Нет прав на удаление комментария");
        }

        _context.Comments.Remove(comment);
        await _context.SaveChangesAsync();

        return new ApiResponse<object>(true, "Комментарий удален");
    }
}