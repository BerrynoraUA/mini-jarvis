using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Telegram.Bot.Types;
using telegram_bot_tasks.Telegram.Models;

namespace Tasks.Application.Interfaces
{
    public interface IProccessorService
    {
        public Task<TelegramRoute> Route(Update update);
        public long? ExtractUserId(Update update);
    }
}
