using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace CalendarApi.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static Guid GetUserId(this ClaimsPrincipal principal)
    {
        var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier)
            ?? principal.FindFirst(JwtRegisteredClaimNames.Sub);
        if (userIdClaim == null)
            throw new UnauthorizedAccessException("User ID not found in token");

        return Guid.Parse(userIdClaim.Value);
    }
}