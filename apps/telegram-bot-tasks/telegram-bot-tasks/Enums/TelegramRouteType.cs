using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Tasks.Domain.Enums
{
    public enum TelegramRouteType
    {
        Unknown = 0,
        Command = 1,
        Callback = 2,
        Message = 3
    }
}
