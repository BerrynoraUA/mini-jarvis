using Google.Apis.Drive.v3;
using Google.Apis.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Tasks.Application.Interfaces;
using Tasks.Domain.Models;
using Telegram.Bot.Types;
using telegram_bot_tasks.Interfaces;
using telegram_bot_tasks.Models;

namespace telegram_bot_tasks.Services
{
    public class GoogleDriveProvider: IGoogleDriveProvider
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly ITelegramSender _sender;
        public GoogleDriveProvider(IConfiguration configuration, ITelegramSender sender)
        {
            _httpClient = new HttpClient();
            _configuration = configuration;
            _sender = sender;
        }

        public async Task<DriveService> GetGoogleDriveClient(long telegramId, long chatId, CancellationToken cancellationToken)
        {
            var accessToken = await GetAccessToken(telegramId, chatId, cancellationToken);
            var initializer = new BaseClientService.Initializer
            {
                HttpClientInitializer = new AccessTokenCredential(accessToken),
                ApplicationName = "Tasks.Bot"
            };
            var driveService = new DriveService(initializer);
            return driveService;
        }

        public async Task<string> GetAccessToken(long telegramId, long chatId,CancellationToken cancellationToken)
        {
            var backendUrl = _configuration["BackendUrl"];

            var response = await _httpClient.GetAsync($"{backendUrl}/auth/google-token/{telegramId}",cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                await _sender.SendTextAsync(new SendTextRequest
                {
                    ChatId = chatId,
                    Text = $"Спочатку зроби /connect",
                }, cancellationToken);

                return null;
            }
            var content = await response.Content.ReadAsStringAsync(cancellationToken);

            var data = JsonSerializer.Deserialize<GoogleTokenResponse>(content);

            var accessToken = data!.accessToken;

            return accessToken;
        }
    }
}
