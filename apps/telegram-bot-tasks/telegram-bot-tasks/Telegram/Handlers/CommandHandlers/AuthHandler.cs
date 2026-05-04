using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Tasks.Application.Interfaces;
using Tasks.Domain.Enums;
using Tasks.Domain.Models;
using Telegram.Bot.Types;
using Telegram.Bot.Types.ReplyMarkups;
using telegram_bot_tasks.Telegram.Handlers.Interfaces;
using telegram_bot_tasks.Telegram.Keyboards;
using telegram_bot_tasks.Telegram.Models;

namespace telegram_bot_tasks.Telegram.Handlers.CommandHandlers
{
    public class AuthHandler : IHandler
    {
        private TelegramRoute telegramRoute;
        private readonly ITelegramSender _sender;
        IConfiguration _configuration;
        public AuthHandler(ITelegramSender sender, IConfiguration configuration)
        {
            telegramRoute = new TelegramRoute(TelegramRouteType.Command, "/connect");
            _sender = sender;
            _configuration = configuration;
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

            var loginUrl = $"{backendUrl}/auth/login-google?telegramId={telegramUserId}";

            await _sender.SendTextAsync(new SendTextRequest
            {
                ChatId = chatId,
                Text = $"""
                        <b>🔐 Підключення Google акаунта</b>

                        Натисни на посилання нижче, щоб авторизуватись:

                        👉 <a href="{loginUrl}">Увійти через Google</a>
                        {loginUrl}
                        Після авторизації повернись у Telegram.
                        """
            }, cancellationToken);
        }
    }
}
