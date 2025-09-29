using SagaStateMachine.BuildingBlocks.Contracts;

namespace SagaStateMachine.Inventory.API.EventHandlers;

public class ReserveInventoryEventHandler(InventoryDatabaseContext dbContext, ILogger<ReserveInventoryEventHandler> logger) : IConsumer<ReserveInventory>
{
    private readonly InventoryDatabaseContext _dbContext = dbContext;

    private readonly ILogger<ReserveInventoryEventHandler> _logger = logger;

    public async Task Consume(ConsumeContext<ReserveInventory> context)
    {
        _logger.LogInformation("Reserving inventory for order {OrderId}", context.Message.OrderId);

        try
        {
            var inventory = _dbContext.Inventories.FirstOrDefault(x => x.ProductId == context.Message.ProductId) ?? throw new Exception("Inventory not found");

            inventory.ReserveInventory();

            await context.Publish(new InventoryReserved
            {
                OrderId = context.Message.OrderId,
            });

            await _dbContext.SaveChangesAsync();

            _logger.LogInformation("Inventory reserved for order {OrderId}", context.Message.OrderId);
        }
        catch (Exception ex)
        {
            await context.Publish(new OrderFailed
            {
                OrderId = context.Message.OrderId,
                Reason = ex.Message
            });

            _logger.LogError(ex, "Error reserving inventory for order {OrderId}", context.Message.OrderId);
        }
    }
}