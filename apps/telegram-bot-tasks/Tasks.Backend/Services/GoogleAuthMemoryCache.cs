using Microsoft.Extensions.Caching.Memory;
using Tasks.Backend.Interfaces;
using Tasks.Backend.Models;

namespace Tasks.Backend.Services
{
    public class GoogleAuthMemoryCache : IGoogleAuthCache
    {
        private readonly IMemoryCache _cache;

        public GoogleAuthMemoryCache(IMemoryCache cache)
        {
            _cache = cache;
        }


        public void SaveGoogleTokens(long telegramUserId, GoogleTokenPayload tokens)
        {
            _cache.Set(
                GetGoogleTokensKey(telegramUserId),
                tokens,
                TimeSpan.FromDays(10));
        }

        public GoogleTokenPayload? GetGoogleTokens(long telegramUserId)
        {
            return _cache.TryGetValue<GoogleTokenPayload>(
                GetGoogleTokensKey(telegramUserId),
                out var tokens)
                ? tokens
                : null;
        }

        public void RemoveGoogleTokens(long telegramUserId)
        {
            _cache.Remove(GetGoogleTokensKey(telegramUserId));
        }

        private static string GetGoogleTokensKey(long telegramUserId)
        {
            return $"google_auth:{telegramUserId}";
        }
    }
}
