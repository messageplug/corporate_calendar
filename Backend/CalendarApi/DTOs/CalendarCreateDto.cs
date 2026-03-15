using System.ComponentModel.DataAnnotations;

namespace CalendarApi.DTOs;

public class CalendarCreateDto
{
    [Required]
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public string Color { get; set; } = "#3b82f6";
    public bool IsPublic { get; set; }
}