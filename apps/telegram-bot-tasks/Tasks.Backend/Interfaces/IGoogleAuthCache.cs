using Tasks.Backend.Models;

namespace Tasks.Backend.Interfaces
{
    public interface IGoogleAuthCache
    {
        void SaveGoogleTokens(long telegramUserId, GoogleTokenPayload tokens);

        GoogleTokenPayload? GetGoogleTokens(long telegramUserId);

        void RemoveGoogleTokens(long telegramUserId);
    }
}
