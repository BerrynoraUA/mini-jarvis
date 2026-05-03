using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Tasks.Domain.Models
{
    public class AnswerCallbackRequest
    {
        public string CallbackQueryId { get; init; } = default!;
        public string? Text { get; init; }
        public bool ShowAlert { get; init; }
    }
}
