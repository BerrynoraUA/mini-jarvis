using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Tasks.Domain.Models;

namespace Tasks.Application.Interfaces
{
    public interface ITelegramSender
    {
        Task SendTextAsync(SendTextRequest request, CancellationToken cancellationToken = default);
        Task SendPhotoAsync(SendPhotoRequest request, CancellationToken cancellationToken = default);
        Task AnswerCallbackAsync(AnswerCallbackRequest request, CancellationToken cancellationToken = default);
        Task EditTextAsync(EditTextRequest request, CancellationToken cancellationToken = default);
    }
}
