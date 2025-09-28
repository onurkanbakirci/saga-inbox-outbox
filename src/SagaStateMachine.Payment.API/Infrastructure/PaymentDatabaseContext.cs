using SagaStateMachine.Payment.API.Infrastructure.Configurations;

namespace SagaStateMachine.Payment.API.Infrastructure;

using SagaStateMachine.Payment.API.Infrastructure.Models;

public class PaymentDatabaseContext(DbContextOptions<PaymentDatabaseContext> options) : DbContext(options)
{
    public DbSet<Payment> Payments { get; set; }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Add MassTransit inbox/outbox tables
        modelBuilder.AddInboxStateEntity();
        modelBuilder.AddOutboxMessageEntity();
        modelBuilder.AddOutboxStateEntity();

        modelBuilder.ApplyConfiguration(new PaymentConfiguration());
    }
}
