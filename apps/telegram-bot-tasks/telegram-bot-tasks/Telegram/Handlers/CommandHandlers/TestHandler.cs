
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
using telegram_bot_tasks.Interfaces;
using telegram_bot_tasks.Models;
using telegram_bot_tasks.Telegram.Handlers.Interfaces;
using telegram_bot_tasks.Telegram.Models;

namespace telegram_bot_tasks.Telegram.Handlers.CommandHandlers
{
    internal class TestHandler : IHandler
    {
        private TelegramRoute telegramRoute;
        private readonly ITelegramSender _sender;
        private readonly IGoogleDriveProvider _googleDriveProvider;
        public TestHandler(ITelegramSender sender, IGoogleDriveProvider googleDriveProvider)
        {
            telegramRoute = new TelegramRoute(TelegramRouteType.Command, "/test");
            _sender = sender;
            _googleDriveProvider = googleDriveProvider;
        }
          
        public bool CanHandle(TelegramRoute telegramRoute)
        {
            return this.telegramRoute == telegramRoute;
        }

        public async Task HandleAsync(TelegramRoute telegramRoute, Update update, CancellationToken cancellationToken)
        {
            var chatId = update.Message.Chat.Id;
            var telegramId = update.Message.From.Id;

            var driveService = await _googleDriveProvider.GetGoogleDriveClient(telegramId, chatId, cancellationToken);

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

