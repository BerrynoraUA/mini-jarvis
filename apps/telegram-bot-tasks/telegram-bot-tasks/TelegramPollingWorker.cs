using Telegram.Bot;
using telegram_bot_tasks.Telegram.Polling;
using telegram_bot_tasks.Telegram.Polling.Interfaces;

namespace telegram_bot_tasks
{
    public class TelegramPollingWorker : BackgroundService
    {
        private readonly ITelegramPollingRunner _pollingRunner;
        private readonly ILogger<TelegramPollingWorker> _logger;

        public TelegramPollingWorker(ITelegramPollingRunner pollingRunner, ILogger<TelegramPollingWorker> logger)
        {
            _pollingRunner = pollingRunner;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            await _pollingRunner.RunAsync(stoppingToken);
        }
    }
}
