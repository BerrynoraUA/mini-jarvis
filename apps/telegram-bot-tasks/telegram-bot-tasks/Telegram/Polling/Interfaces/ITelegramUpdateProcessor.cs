using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Telegram.Bot.Types;

namespace Tasks.Application.Interfaces
{
    public interface ITelegramUpdateProcessor
    {
        Task ProcessAsync(Update update, CancellationToken cancellationToken);
    }
}
