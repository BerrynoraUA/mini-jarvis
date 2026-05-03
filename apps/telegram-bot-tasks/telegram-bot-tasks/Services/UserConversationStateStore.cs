using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Tasks.Application.Interfaces;
using Tasks.Domain.Models;

namespace Tasks.Application.Services
{
    public class UserConversationStateStore : IUserConversationStateStore
    {
      private readonly ConcurrentDictionary<long, UserConversationState> _states = new();
        public async Task<UserConversationState?> GetAsync(long userId)
        {
            _states.TryGetValue(userId, out var state);
            return state;
        }

        public async Task SetAsync(UserConversationState state)
        {
            _states[state.UserId] = state;
        }

        public async Task ClearAsync(long userId)
        {
            _states.TryRemove(userId, out _);
        }
    }
}
