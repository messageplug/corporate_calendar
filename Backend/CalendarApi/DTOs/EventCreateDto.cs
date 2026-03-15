using System.ComponentModel.DataAnnotations;

namespace CalendarApi.DTOs;

public class EventCreateDto
{
    [Required]
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    
    [Required]
    public DateTime Start { get; set; }
    
    [Required]
    public DateTime End { get; set; }
    
    [Required]
    public Guid CalendarId { get; set; }
    
    public string? Location { get; set; }
    public string? Color { get; set; }
    
    public List<Guid> Participants { get; set; } = new();
}