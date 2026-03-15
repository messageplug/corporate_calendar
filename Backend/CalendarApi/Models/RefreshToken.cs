using System.ComponentModel.DataAnnotations;

namespace CalendarApi.Models;

public class RefreshToken
{
    [Key]
    public Guid Id { get; set; }
    
    public Guid UserId { get; set; }
    
    [Required]
    public string Token { get; set; } = null!;
    
    public DateTime Expires { get; set; }
    public bool IsRevoked { get; set; }

    public User User { get; set; } = null!;
}