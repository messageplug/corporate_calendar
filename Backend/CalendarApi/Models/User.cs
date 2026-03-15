using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CalendarApi.Models;

public class User
{
    [Key]
    public Guid Id { get; set; }
    
    [Required]
    [EmailAddress]
    public string Email { get; set; } = null!;
    
    [Required]
    public string Name { get; set; } = null!;
    
    [Required]
    public string PasswordHash { get; set; } = null!;
    
    [Required]
    public string Role { get; set; } = "USER"; // ADMIN, MANAGER, USER
    
    public DateTime CreatedAt { get; set; }
    public bool IsActive { get; set; } = true;
    public string? Avatar { get; set; }

    // Navigation properties
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    public ICollection<CalendarMember> CalendarMemberships { get; set; } = new List<CalendarMember>();
    public ICollection<CalendarManager> ManagedCalendars { get; set; } = new List<CalendarManager>();
    public ICollection<Event> CreatedEvents { get; set; } = new List<Event>();
    public ICollection<EventParticipant> EventParticipations { get; set; } = new List<EventParticipant>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
}