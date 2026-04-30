using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace telegram_bot_tasks.Telegram.Polling.Interfaces
{
    public interface ITelegramPollingRunner
    {
      Task RunAsync(CancellationToken cancellationToken);
    }
}
