using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Tasks.Domain.Enums;
using Tasks.Domain.Models;

namespace telegram_bot_tasks.Telegram.Models
{
    public sealed record TelegramRoute(TelegramRouteType Type,string Key,UserConversationState state = null);
}
