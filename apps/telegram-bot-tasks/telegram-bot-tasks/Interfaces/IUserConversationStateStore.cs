using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Tasks.Domain.Models;

namespace Tasks.Application.Interfaces
{
    public interface IUserConversationStateStore
    {
        Task <UserConversationState?> GetAsync(long userId);
        Task SetAsync(UserConversationState state);
        Task ClearAsync(long userId);
    }

}
