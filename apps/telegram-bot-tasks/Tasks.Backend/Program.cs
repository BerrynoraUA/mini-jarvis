using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Tasks.Backend.Interfaces;
using Tasks.Backend.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddMemoryCache();
builder.Services.AddAuthorization();
builder.Services.AddSingleton<IGoogleAuthCache, GoogleAuthMemoryCache>();
builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = GoogleDefaults.AuthenticationScheme;
    })
    .AddCookie()
    .AddGoogle(options =>
    {
        options.ClientId = builder.Configuration["Authentication:Google:ClientId"]!;
        options.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"]!;

        options.SaveTokens = true;
        options.Scope.Add("https://www.googleapis.com/auth/drive");
        options.Scope.Add("openid");
        options.Scope.Add("profile");
        options.Scope.Add("email");

        options.AccessType = "offline";

        options.Events.OnRedirectToAuthorizationEndpoint = context =>
        {
            var redirectUri = context.RedirectUri;

            if (!redirectUri.Contains("prompt="))
            {
                redirectUri += redirectUri.Contains("?")
                    ? "&prompt=consent"
                    : "?prompt=consent";
            }

            context.Response.Redirect(redirectUri);
            return Task.CompletedTask;
        };
    });

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();



app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
