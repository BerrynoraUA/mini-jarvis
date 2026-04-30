using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Telegram.Bot.Types.ReplyMarkups;

namespace Tasks.Domain.Models
{
    public sealed class EditTextRequest
    {
        public long ChatId { get; init; }
        public int MessageId { get; init; }
        public string Text { get; init; } = default!;
        public InlineKeyboardMarkup? ReplyMarkup { get; init; }
    }
}
