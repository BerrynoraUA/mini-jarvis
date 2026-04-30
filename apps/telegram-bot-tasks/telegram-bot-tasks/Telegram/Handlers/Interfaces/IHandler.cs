using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Telegram.Bot.Types;
using telegram_bot_tasks.Telegram.Models;

namespace telegram_bot_tasks.Telegram.Handlers.Interfaces
{
    public interface IHandler
    {
        bool CanHandle(TelegramRoute telegramRoute);
        Task HandleAsync(TelegramRoute telegramRoute, Update update, CancellationToken cancellationToken);
    }
}
