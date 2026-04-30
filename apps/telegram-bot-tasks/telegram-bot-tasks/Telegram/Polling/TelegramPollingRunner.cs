using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Tasks.Application.Interfaces;
using Telegram.Bot;
using Telegram.Bot.Polling;
using Telegram.Bot.Types;
using Telegram.Bot.Types.Enums;
using telegram_bot_tasks.Telegram.Polling.Interfaces;

namespace telegram_bot_tasks.Telegram.Polling
{
    public class TelegramPollingRunner: ITelegramPollingRunner
    {
        private readonly ITelegramBotClient _botClient;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<TelegramPollingRunner> _logger;

        public TelegramPollingRunner(ITelegramBotClient botClient, IServiceScopeFactory scopeFactory, ILogger<TelegramPollingRunner> logger)
        {
            _botClient = botClient;
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        public async Task RunAsync(CancellationToken cancellationToken)
        {
            var me = await _botClient.GetMe(cancellationToken);

            _logger.LogInformation("Starting Telegram polling for bot @{Username}", me.Username, me.Id);

            _botClient.StartReceiving(
                updateHandler: HandleUpdateAsync,
                errorHandler: HandlePollingErrorAsync,
                receiverOptions: new ReceiverOptions
                {
                    AllowedUpdates = Array.Empty<UpdateType>()
                },
                cancellationToken: cancellationToken);

            try
            {
                await Task.Delay(Timeout.Infinite, cancellationToken);
            }
            catch (OperationCanceledException)
            {
                _logger.LogInformation("Telegram polling stopped");
            }
        }

        private async Task HandleUpdateAsync(ITelegramBotClient botClient, Update update, CancellationToken cancellationToken)
        {
            using var scope = _scopeFactory.CreateScope();
            var processor = scope.ServiceProvider.GetRequiredService<ITelegramUpdateProcessor>();

            await processor.ProcessAsync(update, cancellationToken);
        }

        private Task HandlePollingErrorAsync(ITelegramBotClient botClient, Exception exception, CancellationToken cancellationToken)
        {
            _logger.LogError(exception, "Polling error");
            return Task.CompletedTask;
        }
    }
}
