using MassTransit;
using Microsoft.EntityFrameworkCore;

namespace SagaStateMachine.Payment.API.Infrastructure;

public class PaymentDatabaseContext(DbContextOptions<PaymentDatabaseContext> options) : DbContext(options)
{
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Add MassTransit inbox/outbox tables
        modelBuilder.AddInboxStateEntity();
        modelBuilder.AddOutboxMessageEntity();
        modelBuilder.AddOutboxStateEntity();
    }
}
