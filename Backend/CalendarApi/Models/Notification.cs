using System.ComponentModel.DataAnnotations;

namespace CalendarApi.Models;

public class Notification
{
    [Key]
    public Guid Id { get; set; }

    public Guid UserId { get; set; }
    public string Type { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string Message { get; set; } = null!;
    public Guid? RelatedEntityId { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }

    public User User { get; set; } = null!;
}