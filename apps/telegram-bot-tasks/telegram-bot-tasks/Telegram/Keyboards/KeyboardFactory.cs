using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Telegram.Bot.Types.ReplyMarkups;

namespace telegram_bot_tasks.Telegram.Keyboards
{
    public class KeyboardFactory: IKeyboardFactory
    {
        public ReplyKeyboardMarkup StartMenu()
        {
            return new ReplyKeyboardMarkup(new[]
            {
                new KeyboardButton[]
                {
                    new("📋 Завдання")
                },
                new KeyboardButton[]
                {
                    new("⚙️ Налаштування"),
                    new("❓ Допомога")
                }
              })
            {
                ResizeKeyboard = true
            };
        }
    }
}
