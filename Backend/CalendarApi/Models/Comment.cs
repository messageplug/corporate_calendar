using System.ComponentModel.DataAnnotations;

namespace CalendarApi.Models;

public class Comment
{
    [Key]
    public Guid Id { get; set; }
    
    public Guid EventId { get; set; }
    public Guid UserId { get; set; }
    
    [Required]
    public string Content { get; set; } = null!;
    
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public Event Event { get; set; } = null!;
    public User User { get; set; } = null!;
}