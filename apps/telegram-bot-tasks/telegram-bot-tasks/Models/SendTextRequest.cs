using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Telegram.Bot.Types.ReplyMarkups;

namespace Tasks.Domain.Models
{
    public class SendTextRequest
    {
        public long ChatId { get; init; }
        public string Text { get; init; } = default!;
        public ReplyMarkup? ReplyMarkup { get; init; }
    }
}
