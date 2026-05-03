using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Tasks.Backend.Interfaces;
using Tasks.Backend.Models;

[Route("auth")]
public class AuthController : Controller
{
    private readonly IGoogleAuthCache _googleAuthCache;
    private readonly IConfiguration _configuration;

    public AuthController(
        IGoogleAuthCache googleAuthCache,
        IConfiguration configuration)
    {
        _googleAuthCache = googleAuthCache;
        _configuration = configuration;
    }

    [HttpGet("login-google")]
    public IActionResult LoginWithGoogle([FromQuery] long telegramId)
    {

        var redirectUrl = Url.Action(
            action: "GoogleResponse",
            controller: "Auth",
            values: new { telegramId },
            protocol: Request.Scheme);

        var properties = new AuthenticationProperties
        {
            RedirectUri = redirectUrl
        };

        return Challenge(properties, GoogleDefaults.AuthenticationScheme);
    }

    [HttpGet("google-response")]
    public async Task<IActionResult> GoogleResponse([FromQuery] long telegramId)
    {

        var result = await HttpContext.AuthenticateAsync(
            CookieAuthenticationDefaults.AuthenticationScheme);

        if (!result.Succeeded || result.Principal == null)
        {
            return BadRequest("Google authentication failed.");
        }

        var accessToken = result.Properties?.GetTokenValue("access_token");
        var refreshToken = result.Properties?.GetTokenValue("refresh_token");
        var expiresAtRaw = result.Properties?.GetTokenValue("expires_at");

        if (string.IsNullOrWhiteSpace(accessToken))
        {
            return BadRequest("Google access token was not received.");
        }

        var expiresAt = DateTimeOffset.UtcNow.AddHours(1);

        if (DateTimeOffset.TryParse(expiresAtRaw, out var parsedExpiresAt))
        {
            expiresAt = parsedExpiresAt;
        }

        var email = result.Principal.FindFirst(ClaimTypes.Email)?.Value;
        var googleUserId = result.Principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        var tokens = new GoogleTokenPayload
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = expiresAt,
            Email = email,
            GoogleUserId = googleUserId
        };

        _googleAuthCache.SaveGoogleTokens(telegramId, tokens);

        return Content("Google account connected. You can return to Telegram.");
    }

    [HttpGet("google-session/{telegramUserId:long}")]
    public IActionResult GetGoogleSession(long telegramUserId)
    {
        var tokens = _googleAuthCache.GetGoogleTokens(telegramUserId);

        if (tokens == null)
        {
            return Unauthorized("Google account is not connected.");
        }

        return Ok(new
        {
            isConnected = true,
            email = tokens.Email,
            expiresAt = tokens.ExpiresAt
        });
    }

    [HttpGet("google-token/{telegramUserId:long}")]
    public IActionResult GetGoogleToken(long telegramUserId)
    {
        var tokens = _googleAuthCache.GetGoogleTokens(telegramUserId);

        if (tokens == null)
        {
            return Unauthorized();
        }

        return Ok(new
        {
            accessToken = tokens.AccessToken,
            expiresAt = tokens.ExpiresAt
        });
    }

    [HttpPost("logout-google/{telegramUserId:long}")]
    public IActionResult LogoutGoogle(long telegramUserId)
    {
        _googleAuthCache.RemoveGoogleTokens(telegramUserId);

        return Ok();
    }
}