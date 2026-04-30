using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Tasks.Application.Interfaces;
using Tasks.Domain.Enums;
using Telegram.Bot.Types;
using telegram_bot_tasks.Telegram.Models;

namespace Tasks.Application.Services
{
    public class ProccessorService: IProccessorService
    {
        private readonly IUserConversationStateStore _conversationStateStore;
        public ProccessorService(IUserConversationStateStore conversationStateStore)
        {
            _conversationStateStore = conversationStateStore;
        }
        public async Task<TelegramRoute> Route(Update update)
        {
            var userId = update.Message.From.Id;
            var state = await _conversationStateStore.GetAsync(userId);

            if (update.Message?.Text is not null)
            {
                var text = update.Message.Text.Trim();

                if (text.StartsWith('/'))
                {
                    var command = text.Split(' ', StringSplitOptions.RemoveEmptyEntries)[0];
                    return new TelegramRoute(TelegramRouteType.Command, command, state);
                }

                return new TelegramRoute(TelegramRouteType.Message, text, state);
            }

            if (update.CallbackQuery?.Data is not null)
            {
                return new TelegramRoute(TelegramRouteType.Callback, update.CallbackQuery.Data, state);
            }

            return new TelegramRoute(TelegramRouteType.Unknown,"unknown");
        }
        public  long? ExtractUserId(Update update)
        {
            return update.Message?.From?.Id
                ?? update.CallbackQuery?.From?.Id;
        }
    }
}
