using MassTransit;
using Microsoft.EntityFrameworkCore;

namespace SagaStateMachine.Inventory.API.Infrastructure;

public class InventoryDatabaseContext(DbContextOptions<InventoryDatabaseContext> options) : DbContext(options)
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
