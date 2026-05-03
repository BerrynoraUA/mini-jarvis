using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Tasks.Domain.Models
{
    public class GoogleTokenResponse
    {
        public string accessToken { get; set; }
        public DateTimeOffset expiresAt { get; set; }
    }
}
