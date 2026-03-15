namespace CalendarApi.Models;

public class CalendarManager
{
    public Guid CalendarId { get; set; }
    public Calendar Calendar { get; set; } = null!;
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
}