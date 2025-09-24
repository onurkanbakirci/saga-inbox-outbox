using MassTransit;
using SagaStateMachine.BuildingBlocks.Contracts;

namespace SagaStateMachine.Inventory.API.EventHandlers;

public class ReserveInventoryEventHandler(ILogger<ReserveInventoryEventHandler> logger, IPublishEndpoint publishEndpoint) : IConsumer<ReserveInventory>
{
    private readonly ILogger<ReserveInventoryEventHandler> _logger = logger;
    private readonly IPublishEndpoint _publishEndpoint = publishEndpoint;

    public async Task Consume(ConsumeContext<ReserveInventory> context)
    {
        _logger.LogInformation("Reserving inventory for order: {OrderId}", context.Message.OrderId);

        // Simulate inventory check
        await Task.Delay(1000);

        // 95% success rate
        if (Random.Shared.Next(100) < 95)
        {
            await _publishEndpoint.Publish(new InventoryReserved
            {
                OrderId = context.Message.OrderId
            });
        }
        else
        {
            await _publishEndpoint.Publish(new OrderFailed
            {
                OrderId = context.Message.OrderId,
                Reason = "Inventory not available"
            });
        }
    }
}