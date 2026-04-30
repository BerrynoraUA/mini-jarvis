using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Tasks.Infrastructure.Persistence
{
    public class TasksDbContent : DbContext
    {
        public TasksDbContent(DbContextOptions<TasksDbContent> options) : base(options)
        {

        }
    }
}
