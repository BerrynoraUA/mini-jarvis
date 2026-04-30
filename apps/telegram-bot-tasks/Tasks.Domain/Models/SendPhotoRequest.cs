using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Telegram.Bot.Types.ReplyMarkups;

namespace Tasks.Domain.Models
{
    public class SendPhotoRequest
    {
        public long ChatId { get; init; }
        public string Photo { get; init; } = default!;
        public string? Caption { get; init; }
        public ReplyMarkup? ReplyMarkup { get; init; }
    }
}
