using CalendarApi.Data;
using CalendarApi.DTOs;
using CalendarApi.Models;
using CalendarApi.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace CalendarApi.Tests.Services
{
    public class CalendarServiceTests
    {
        private readonly Mock<ApplicationDbContext> _mockContext;
        private readonly Mock<DbSet<Calendar>> _mockCalendars;
        private readonly Mock<DbSet<User>> _mockUsers;
        private readonly CalendarService _service;

        public CalendarServiceTests()
        {
            _mockContext = new Mock<ApplicationDbContext>();
            _mockCalendars = new Mock<DbSet<Calendar>>();
            _mockUsers = new Mock<DbSet<User>>();
            _mockContext.Setup(c => c.Calendars).Returns(_mockCalendars.Object);
            _mockContext.Setup(c => c.Users).Returns(_mockUsers.Object);
            _service = new CalendarService(_mockContext.Object, Mock.Of<ILogger<CalendarService>>());
        }

        [Fact]
        public async Task GetAllAsync_Admin_ReturnsAllCalendars()
        {
            // Arrange
            var adminId = Guid.NewGuid();
            var admin = new User { Id = adminId, Role = "ADMIN" };
            var calendars = new List<Calendar>
            {
                new Calendar { Id = Guid.NewGuid(), Name = "Public", IsPublic = true, Members = new List<CalendarMember>() },
                new Calendar { Id = Guid.NewGuid(), Name = "Private", IsPublic = false, Members = new List<CalendarMember>() }
            }.AsQueryable();

            _mockUsers.Setup(u => u.FindAsync(adminId)).ReturnsAsync(admin);
            _mockCalendars.As<IQueryable<Calendar>>().Setup(m => m.Provider).Returns(calendars.Provider);
            _mockCalendars.As<IQueryable<Calendar>>().Setup(m => m.Expression).Returns(calendars.Expression);
            _mockCalendars.As<IQueryable<Calendar>>().Setup(m => m.ElementType).Returns(calendars.ElementType);
            _mockCalendars.As<IQueryable<Calendar>>().Setup(m => m.GetEnumerator()).Returns(calendars.GetEnumerator());

            // Act
            var result = await _service.GetAllAsync(adminId);

            // Assert
            Assert.True(result.Success);
            Assert.Equal(2, result.Data.Count);
        }

        [Fact]
        public async Task GetAllAsync_User_ReturnsOnlyPublicAndOwned()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var user = new User { Id = userId, Role = "USER" };
            var calendar1 = new Calendar { Id = Guid.NewGuid(), Name = "Public", IsPublic = true, Members = new List<CalendarMember>() };
            var calendar2 = new Calendar
            {
                Id = Guid.NewGuid(),
                Name = "Private user member",
                IsPublic = false,
                Members = new List<CalendarMember> { new CalendarMember { UserId = userId } }
            };
            var calendar3 = new Calendar { Id = Guid.NewGuid(), Name = "Private not member", IsPublic = false, Members = new List<CalendarMember>() };
            var calendars = new List<Calendar> { calendar1, calendar2, calendar3 }.AsQueryable();

            _mockUsers.Setup(u => u.FindAsync(userId)).ReturnsAsync(user);
            _mockCalendars.As<IQueryable<Calendar>>().Setup(m => m.Provider).Returns(calendars.Provider);
            _mockCalendars.As<IQueryable<Calendar>>().Setup(m => m.Expression).Returns(calendars.Expression);
            _mockCalendars.As<IQueryable<Calendar>>().Setup(m => m.ElementType).Returns(calendars.ElementType);
            _mockCalendars.As<IQueryable<Calendar>>().Setup(m => m.GetEnumerator()).Returns(calendars.GetEnumerator());

            // Act
            var result = await _service.GetAllAsync(userId);

            // Assert
            Assert.True(result.Success);
            Assert.Equal(2, result.Data.Count);
            Assert.Contains(result.Data, c => c.Id == calendar1.Id);
            Assert.Contains(result.Data, c => c.Id == calendar2.Id);
        }
    }
}