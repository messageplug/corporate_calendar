using System.ComponentModel.DataAnnotations;

namespace CalendarApi.Models;

public class Calendar
{
    [Key]
    public Guid Id { get; set; }
    
    [Required]
    public string Name { get; set; } = null!;
    
    public string? Description { get; set; }
    
    public string Color { get; set; } = "#3b82f6";
    
    public Guid CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsPublic { get; set; }
    public bool IsArchived { get; set; }

    // Navigation
    public User Creator { get; set; } = null!;
    public ICollection<CalendarMember> Members { get; set; } = new List<CalendarMember>();
    public ICollection<CalendarManager> Managers { get; set; } = new List<CalendarManager>();
    public ICollection<Event> Events { get; set; } = new List<Event>();
}