using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Tasks.Application.Interfaces;
using Tasks.Domain.Enums;
using Tasks.Domain.Models;
using Telegram.Bot.Types;
using telegram_bot_tasks.Telegram.Handlers.Interfaces;
using telegram_bot_tasks.Telegram.Models;

namespace telegram_bot_tasks.Telegram.Handlers.MessageHandlers
{
    public class SettingsMessageHandler : IHandler
    {
        private TelegramRoute telegramRoute;
        private readonly ITelegramSender _telegramSender;

        public SettingsMessageHandler(ITelegramSender telegramSender)
        {
            telegramRoute = new TelegramRoute(TelegramRouteType.Message, "📋 Завдання");
            _telegramSender = telegramSender;
        }

        public bool CanHandle(TelegramRoute telegramRoute)
        {
            return this.telegramRoute == telegramRoute;
        }

        public async Task HandleAsync(TelegramRoute telegramRoute, Update update, CancellationToken cancellationToken)
        {
          await _telegramSender.SendTextAsync(new SendTextRequest
            {
                ChatId = update.Message!.Chat.Id,
                Text = "Налаштування завдань"
            }, cancellationToken);
        }
    }
}
