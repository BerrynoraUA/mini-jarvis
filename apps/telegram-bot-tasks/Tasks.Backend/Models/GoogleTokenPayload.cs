namespace Tasks.Backend.Models
{
    public class GoogleTokenPayload
    {
        public string AccessToken { get; set; } = string.Empty;
        public string? RefreshToken { get; set; }
        public DateTimeOffset ExpiresAt { get; set; }

        public string? Email { get; set; }
        public string? GoogleUserId { get; set; }
    }
}
