using System.ComponentModel.DataAnnotations;

namespace CalendarApi.DTOs;

public class RegisterRequest
{
    [Required]
    public string Name { get; set; } = null!;
    
    [Required]
    [EmailAddress]
    public string Email { get; set; } = null!;
    
    [Required]
    [MinLength(6)]
    public string Password { get; set; } = null!;
    
    public string Role { get; set; } = "USER"; // по умолчанию
}