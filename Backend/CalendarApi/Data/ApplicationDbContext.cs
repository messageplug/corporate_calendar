using Microsoft.EntityFrameworkCore;
using CalendarApi.Models;

namespace CalendarApi.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<Notification> Notifications { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Calendar> Calendars { get; set; }
    public DbSet<CalendarMember> CalendarMembers { get; set; }
    public DbSet<CalendarManager> CalendarManagers { get; set; }
    public DbSet<Event> Events { get; set; }
    public DbSet<EventParticipant> EventParticipants { get; set; }
    public DbSet<Comment> Comments { get; set; }
    public DbSet<RefreshToken> RefreshTokens { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Составные ключи
        modelBuilder.Entity<CalendarMember>()
            .HasKey(cm => new { cm.CalendarId, cm.UserId });

        modelBuilder.Entity<CalendarManager>()
            .HasKey(cm => new { cm.CalendarId, cm.UserId });

        modelBuilder.Entity<EventParticipant>()
            .HasKey(ep => new { ep.EventId, ep.UserId });

        // Индексы
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<RefreshToken>()
            .HasIndex(rt => rt.Token)
            .IsUnique();

        modelBuilder.Entity<Event>()
            .HasIndex(e => e.Start);

        modelBuilder.Entity<Comment>()
            .HasIndex(c => c.EventId);

        // Связи
        modelBuilder.Entity<Calendar>()
            .HasOne(c => c.Creator)
            .WithMany() // User не имеет коллекции CreatedCalendars (но можно добавить, если нужно)
            .HasForeignKey(c => c.CreatedBy)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<CalendarMember>()
            .HasOne(cm => cm.Calendar)
            .WithMany(c => c.Members)
            .HasForeignKey(cm => cm.CalendarId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<CalendarMember>()
            .HasOne(cm => cm.User)
            .WithMany(u => u.CalendarMemberships)
            .HasForeignKey(cm => cm.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<CalendarManager>()
            .HasOne(cm => cm.Calendar)
            .WithMany(c => c.Managers)
            .HasForeignKey(cm => cm.CalendarId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<CalendarManager>()
            .HasOne(cm => cm.User)
            .WithMany(u => u.ManagedCalendars)
            .HasForeignKey(cm => cm.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Event>()
            .HasOne(e => e.Calendar)
            .WithMany(c => c.Events)
            .HasForeignKey(e => e.CalendarId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Event>()
            .HasOne(e => e.Creator)
            .WithMany(u => u.CreatedEvents)
            .HasForeignKey(e => e.CreatedBy)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<EventParticipant>()
            .HasOne(ep => ep.Event)
            .WithMany(e => e.Participants)
            .HasForeignKey(ep => ep.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<EventParticipant>()
            .HasOne(ep => ep.User)
            .WithMany(u => u.EventParticipations)
            .HasForeignKey(ep => ep.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Comment>()
            .HasOne(c => c.Event)
            .WithMany(e => e.Comments)
            .HasForeignKey(c => c.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Comment>()
            .HasOne(c => c.User)
            .WithMany(u => u.Comments)
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<RefreshToken>()
            .HasOne(rt => rt.User)
            .WithMany(u => u.RefreshTokens)
            .HasForeignKey(rt => rt.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Notification>()
            .HasOne(n => n.User)
            .WithMany()
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Cascade);

                modelBuilder.Entity<Notification>()
                    .HasIndex(n => n.UserId);
    }
}