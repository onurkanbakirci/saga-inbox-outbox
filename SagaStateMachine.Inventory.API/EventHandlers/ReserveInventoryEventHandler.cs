using SagaStateMachine.BuildingBlocks.Contracts;

namespace SagaStateMachine.Inventory.API.EventHandlers;

public class ReserveInventoryEventHandler(
    ILogger<ReserveInventoryEventHandler> logger,
    InventoryDatabaseContext dbContext) : IConsumer<ReserveInventory>
{
    private readonly ILogger<ReserveInventoryEventHandler> _logger = logger;
    private readonly InventoryDatabaseContext _dbContext = dbContext;

    public async Task Consume(ConsumeContext<ReserveInventory> context)
    {
        try
        {
            var inventory = _dbContext.Inventories.FirstOrDefault(x => x.ProductId == context.Message.ProductId);

            inventory.ReserveInventory();

            await context.Publish(new InventoryReserved
            {
                OrderId = context.Message.OrderId,
            });

            await _dbContext.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            await context.Publish(new OrderFailed
            {
                OrderId = context.Message.OrderId,
                Reason = ex.Message
            });
        }
    }
}