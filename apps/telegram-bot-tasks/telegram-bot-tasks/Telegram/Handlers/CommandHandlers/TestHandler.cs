
using Google.Apis.Auth.OAuth2;
using Google.Apis.Drive.v3;
using Google.Apis.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Tasks.Application.Interfaces;
using Tasks.Domain.Enums;
using Tasks.Domain.Models;
using Telegram.Bot.Types;
using telegram_bot_tasks.Services;
using telegram_bot_tasks.Telegram.Handlers.Interfaces;
using telegram_bot_tasks.Telegram.Models;

namespace telegram_bot_tasks.Telegram.Handlers.CommandHandlers
{
    internal class TestHandler : IHandler
    {
        private TelegramRoute telegramRoute;
        private readonly ITelegramSender _sender;
        IConfiguration _configuration;
        HttpClient _httpClient;
        public TestHandler(ITelegramSender sender, IConfiguration configuration)
        {
            telegramRoute = new TelegramRoute(TelegramRouteType.Command, "/test");
            _sender = sender;
            _configuration = configuration;
            _httpClient = new HttpClient();
        }

        public bool CanHandle(TelegramRoute telegramRoute)
        {
            return this.telegramRoute == telegramRoute;
        }

        public async Task HandleAsync(TelegramRoute telegramRoute, Update update, CancellationToken cancellationToken)
        {
            var chatId = update.Message!.Chat.Id;
            var telegramUserId = update.Message.From.Id;

            var backendUrl = _configuration["BackendUrl"];

            var response = await _httpClient.GetAsync(
             $"{backendUrl}/auth/google-token/{telegramUserId}",
                cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                await _sender.SendTextAsync(new SendTextRequest
                {
                    ChatId = chatId,
                    Text = $"Спочатку зроби /connect",
                }, cancellationToken);
                return;
            }

            var content = await response.Content.ReadAsStringAsync(cancellationToken);

            var data = JsonSerializer.Deserialize<GoogleTokenResponse>(content);

            var accessToken = data!.accessToken;

            var initializer = new BaseClientService.Initializer
            {
                HttpClientInitializer = new AccessTokenCredential(accessToken),
                ApplicationName = "Tasks.Bot"
            };

            var driveService = new DriveService(initializer);

            var request = driveService.Files.List();
            request.PageSize = 10;
            request.Fields = "files(id, name)";

            var result = await request.ExecuteAsync(cancellationToken);

            foreach (var file in result.Files)
            {
                await _sender.SendTextAsync(new SendTextRequest
                {
                    ChatId = chatId,
                    Text = $"{file.Name} ({file.Id})",
                }, cancellationToken);
                return;
            }
        }
    }
}

