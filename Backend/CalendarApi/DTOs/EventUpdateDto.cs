namespace CalendarApi.DTOs;

public class EventUpdateDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public DateTime? Start { get; set; }
    public DateTime? End { get; set; }
    public string? Location { get; set; }
    public string? Color { get; set; }
    public string? Status { get; set; }
    public List<Guid>? Participants { get; set; }
}