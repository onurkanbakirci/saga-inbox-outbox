using SagaStateMachine.Notification.API.Infrastructure.Configurations;

namespace SagaStateMachine.Notification.API.Infrastructure;

using SagaStateMachine.Notification.API.Infrastructure.Models;

public class NotificationDatabaseContext(DbContextOptions<NotificationDatabaseContext> options) : DbContext(options)
{
    public DbSet<Notification> Notifications { get; set; }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Add MassTransit inbox/outbox tables
        modelBuilder.AddInboxStateEntity();
        modelBuilder.AddOutboxMessageEntity();
        modelBuilder.AddOutboxStateEntity();

        modelBuilder.ApplyConfiguration(new NotificationConfiguration());
    }
}
