namespace CalendarApi.DTOs;

public class CalendarDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public string Color { get; set; } = null!;
    public Guid CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<Guid> Members { get; set; } = new();
    public List<Guid> Managers { get; set; } = new();
    public bool IsPublic { get; set; }
    public bool IsArchived { get; set; }
}