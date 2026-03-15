using System.ComponentModel.DataAnnotations;

namespace CalendarApi.Models;

public class Event
{
    [Key]
    public Guid Id { get; set; }
    
    [Required]
    public string Title { get; set; } = null!;
    
    public string? Description { get; set; }
    
    public DateTime Start { get; set; }
    public DateTime End { get; set; }
    
    public Guid CalendarId { get; set; }
    public Guid CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    
    public string? Location { get; set; }
    public string? Color { get; set; }
    
    public string Status { get; set; } = "SCHEDULED"; // SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED

    // Navigation
    public Calendar Calendar { get; set; } = null!;
    public User Creator { get; set; } = null!;
    public ICollection<EventParticipant> Participants { get; set; } = new List<EventParticipant>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
}