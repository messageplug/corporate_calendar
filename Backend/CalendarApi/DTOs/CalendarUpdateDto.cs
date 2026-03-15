namespace CalendarApi.DTOs;

public class CalendarUpdateDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? Color { get; set; }
    public bool? IsPublic { get; set; }
}