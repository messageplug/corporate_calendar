using CalendarApi.DTOs;
using CalendarApi.Services;
using CalendarApi.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CalendarApi.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<UserDto>>>> GetAll()
    {
        var userId = User.GetUserId();
        var result = await _userService.GetAllAsync(userId);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<UserDto>>> GetById(Guid id)
    {
        var userId = User.GetUserId();
        var result = await _userService.GetByIdAsync(id, userId);
        if (!result.Success)
            return NotFound(result);
        return Ok(result);
    }

    [HttpPut("{id}/{role}")]
    public async Task<ActionResult<ApiResponse<UserDto>>> UpdateRole(Guid id, string role)
    {
        var userId = User.GetUserId();
        var result = await _userService.UpdateRoleAsync(id, role, userId);
        if (!result.Success)
            return BadRequest(result);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id)
    {
        var userId = User.GetUserId();
        var result = await _userService.DeleteAsync(id, userId);
        if (!result.Success)
            return BadRequest(result);
        return Ok(result);
    }
}