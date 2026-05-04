using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Tasks.Application.Interfaces;
using Tasks.Domain.Models;
using Telegram.Bot;
using Telegram.Bot.Types;
using Telegram.Bot.Types.Enums;

namespace Tasks.Application.Services
{
    public sealed class TelegramSender : ITelegramSender
    {
        private readonly ITelegramBotClient _botClient;

        public TelegramSender(ITelegramBotClient botClient)
        {
            _botClient = botClient;
        }

        public async Task SendTextAsync(SendTextRequest request, CancellationToken cancellationToken = default)
        {
            await _botClient.SendMessage(
                chatId: request.ChatId,
                text: request.Text,
                replyMarkup: request.ReplyMarkup,
                parseMode: ParseMode.Html,
                cancellationToken: cancellationToken);
        }

        public async Task SendPhotoAsync(SendPhotoRequest request, CancellationToken cancellationToken = default)
        {
            await _botClient.SendPhoto(
                chatId: request.ChatId,
                photo: InputFile.FromUri(request.Photo),
                caption: request.Caption,
                replyMarkup: request.ReplyMarkup,
                cancellationToken: cancellationToken);
        }

        public async Task AnswerCallbackAsync(AnswerCallbackRequest request, CancellationToken cancellationToken = default)
        {
            await _botClient.AnswerCallbackQuery(
                callbackQueryId: request.CallbackQueryId,
                text: request.Text,
                showAlert: request.ShowAlert,
                cancellationToken: cancellationToken);
        }

        public async Task EditTextAsync(EditTextRequest request, CancellationToken cancellationToken = default)
        {
            await _botClient.EditMessageText(
                chatId: request.ChatId,
                messageId: request.MessageId,
                text: request.Text,
                replyMarkup: request.ReplyMarkup,
                cancellationToken: cancellationToken);
        }
    }
}
