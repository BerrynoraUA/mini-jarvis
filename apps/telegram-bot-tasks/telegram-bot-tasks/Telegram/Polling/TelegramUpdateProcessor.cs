using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Tasks.Application.Interfaces;
using Tasks.Application.Services;
using Telegram.Bot.Types;
using Telegram.Bot.Types.Enums;
using telegram_bot_tasks.Telegram.Handlers.Interfaces;

namespace telegram_bot_tasks.Telegram.Polling
{
    public class TelegramUpdateProcessor:ITelegramUpdateProcessor
    {
        private readonly IReadOnlyCollection<IHandler> _handlers;
        private readonly ILogger<TelegramUpdateProcessor> _logger;
        private readonly IProccessorService _proccessorService;

        public TelegramUpdateProcessor(IEnumerable<IHandler> handlers, ILogger<TelegramUpdateProcessor> logger, IProccessorService proccessorService)
        {
            _logger = logger;
            _handlers = handlers.ToArray();
            _proccessorService = proccessorService;
        }

        public async Task ProcessAsync(Update update, CancellationToken cancellationToken)
        {
            var route = await _proccessorService.Route(update);

            var handler = _handlers.FirstOrDefault(x => x.CanHandle(route));

            if (handler is null)
            {
                _logger.LogInformation("No handler found for update type {UpdateType}", update.Type);
                return;
            }

            await handler.HandleAsync(route, update, cancellationToken);

            await Task.CompletedTask;
        }
    }
}
