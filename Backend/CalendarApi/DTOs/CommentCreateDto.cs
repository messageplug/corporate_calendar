using System.ComponentModel.DataAnnotations;

namespace CalendarApi.DTOs;

public class CommentCreateDto
{
    [Required]
    public Guid EventId { get; set; }
    
    [Required]
    public string Content { get; set; } = null!;
}