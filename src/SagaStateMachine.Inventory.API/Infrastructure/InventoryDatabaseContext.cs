using SagaStateMachine.Inventory.API.Infrastructure.Configuration;

namespace SagaStateMachine.Inventory.API.Infrastructure;

using SagaStateMachine.Inventory.API.Infrastructure.Models;

public class InventoryDatabaseContext(DbContextOptions<InventoryDatabaseContext> options) : DbContext(options)
{
    public DbSet<Inventory> Inventories { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Add MassTransit inbox/outbox tables
        modelBuilder.AddInboxStateEntity();
        modelBuilder.AddOutboxMessageEntity();
        modelBuilder.AddOutboxStateEntity();

        modelBuilder.ApplyConfiguration(new InventoryConfigurations());
    }
}
