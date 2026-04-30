using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Tasks.Application.Interfaces;
using Tasks.Domain.Enums;
using Tasks.Domain.Models;
using Telegram.Bot;
using Telegram.Bot.Types;
using telegram_bot_tasks.Telegram.Handlers.Interfaces;
using telegram_bot_tasks.Telegram.Keyboards;
using telegram_bot_tasks.Telegram.Models;

namespace telegram_bot_tasks.Telegram.Handlers.CommandHandlers
{
    public class StartHandler : IHandler
    {
        private TelegramRoute telegramRoute;
        private readonly ITelegramSender _sender;
        private readonly IKeyboardFactory _keyboardFactory;
        public StartHandler(ITelegramSender sender, IKeyboardFactory keyboardFactory)
        {
            telegramRoute = new TelegramRoute(TelegramRouteType.Command, "/start");
            _sender = sender;
            _keyboardFactory = keyboardFactory;
        }

        public bool CanHandle(TelegramRoute telegramRoute)
        {
            return this.telegramRoute == telegramRoute;
        }

        public async Task HandleAsync(TelegramRoute telegramRoute, Update update, CancellationToken cancellationToken)
        {
            var chatId = update.Message!.Chat.Id;

            await _sender.SendTextAsync(new SendTextRequest
            {
                ChatId = chatId,
                Text = "Приветствую!",
                ReplyMarkup = _keyboardFactory.StartMenu()
            }, cancellationToken);
        }
    }
}
