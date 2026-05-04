using Google.Apis.Drive.v3;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace telegram_bot_tasks.Interfaces
{
    public interface IGoogleDriveProvider
    {
        Task<DriveService> GetGoogleDriveClient(long telegramId, long chatId, CancellationToken cancellationToken);
        Task<string> GetAccessToken(long telegramId, long chatId, CancellationToken cancellationToken);
    }
}
