using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Tasks.Domain.Enums;

namespace Tasks.Domain.Models
{
    public class UserConversationState
    {
        public long UserId { get; init; }
        public ConversationStates State { get; set; } = default!;
        public string? Data { get; set; }
    }
}
