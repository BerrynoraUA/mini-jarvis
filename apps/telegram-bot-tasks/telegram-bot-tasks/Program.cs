using Tasks.Application.Interfaces;
using Tasks.Application.Services;
using Tasks.Domain.Models;
using Telegram.Bot;
using telegram_bot_tasks;
using telegram_bot_tasks.Telegram.Handlers.CommandHandlers;
using telegram_bot_tasks.Telegram.Handlers.Interfaces;
using telegram_bot_tasks.Telegram.Handlers.MessageHandlers;
using telegram_bot_tasks.Telegram.Keyboards;
using telegram_bot_tasks.Telegram.Polling;
using telegram_bot_tasks.Telegram.Polling.Interfaces;

var builder = Host.CreateApplicationBuilder(args);
builder.Services.AddHostedService<TelegramPollingWorker>();

var host = Host.CreateDefaultBuilder(args)
    .ConfigureServices((context, services) =>
    {
        services.AddSingleton<ITelegramBotClient>(_ =>
            new TelegramBotClient(context.Configuration["Telegram:BotToken"]!));
        services.AddSingleton<IUserConversationStateStore, UserConversationStateStore>();
        services.AddScoped<ITelegramUpdateProcessor, TelegramUpdateProcessor>();
        services.AddSingleton<ITelegramPollingRunner, TelegramPollingRunner>();
        services.AddScoped<ITelegramSender, TelegramSender>();
        services.AddScoped<IKeyboardFactory, KeyboardFactory>();
        services.AddScoped<IHandler, StartHandler>();
        services.AddScoped<IHandler, SettingsMessageHandler>();
        services.AddScoped<IProccessorService, ProccessorService>();
        services.AddHostedService<TelegramPollingWorker>();
    })
    .Build();
host.Run();
