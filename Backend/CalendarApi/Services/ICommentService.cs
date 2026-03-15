using CalendarApi.DTOs;

namespace CalendarApi.Services;

public interface ICommentService
{
    Task<ApiResponse<List<CommentDto>>> GetByEventIdAsync(Guid eventId, Guid userId);
    Task<ApiResponse<CommentDto>> CreateAsync(CommentCreateDto dto, Guid userId);
    Task<ApiResponse<CommentDto>> UpdateAsync(Guid id, string content, Guid userId);
    Task<ApiResponse<object>> DeleteAsync(Guid id, Guid userId);
}