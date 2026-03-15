namespace CalendarApi.Models;

public class CalendarMember
{
    public Guid CalendarId { get; set; }
    public Calendar Calendar { get; set; } = null!;
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
}