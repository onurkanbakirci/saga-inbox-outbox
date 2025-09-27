using MassTransit;
using SagaStateMachine.BuildingBlocks.Contracts;
using SagaStateMachine.Inventory.API.Infrastructure;

namespace SagaStateMachine.Inventory.API.EventHandlers;

public class ReserveInventoryEventHandler(
    ILogger<ReserveInventoryEventHandler> logger, 
    InventoryDatabaseContext dbContext) : IConsumer<ReserveInventory>
{
    private readonly ILogger<ReserveInventoryEventHandler> _logger = logger;
    private readonly InventoryDatabaseContext _dbContext = dbContext;

    public async Task Consume(ConsumeContext<ReserveInventory> context)
    {
        _logger.LogInformation("Reserving inventory for order: {OrderId}", context.Message.OrderId);

        // Simulate inventory check (business logic would go here)
        await Task.Delay(1000);

        // 95% success rate
        if (Random.Shared.Next(100) < 95)
        {
            // Publish message using outbox pattern - message will be stored in outbox table
            // and published reliably by the outbox delivery service
            await context.Publish(new InventoryReserved
            {
                OrderId = context.Message.OrderId
            });
            
            _logger.LogInformation("Inventory reserved successfully for order: {OrderId}", context.Message.OrderId);
        }
        else
        {
            // Publish failure message using outbox pattern
            await context.Publish(new OrderFailed
            {
                OrderId = context.Message.OrderId,
                Reason = "Inventory not available"
            });
            
            _logger.LogWarning("Inventory reservation failed for order: {OrderId}", context.Message.OrderId);
        }
    }
}