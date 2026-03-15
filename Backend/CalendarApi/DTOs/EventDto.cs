namespace CalendarApi.DTOs;

public class EventDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public DateTime Start { get; set; }
    public DateTime End { get; set; }
    public Guid CalendarId { get; set; }
    public Guid CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? Location { get; set; }
    public string? Color { get; set; }
    public string Status { get; set; } = null!;
    public List<Guid> Participants { get; set; } = new();
}