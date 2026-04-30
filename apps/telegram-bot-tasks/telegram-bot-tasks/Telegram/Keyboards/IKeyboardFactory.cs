using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Telegram.Bot.Types.ReplyMarkups;

namespace telegram_bot_tasks.Telegram.Keyboards
{
    public interface IKeyboardFactory
    {
        ReplyKeyboardMarkup StartMenu();
    }
}
