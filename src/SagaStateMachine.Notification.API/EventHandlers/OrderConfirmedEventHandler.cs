using SagaStateMachine.BuildingBlocks.Contracts;

namespace SagaStateMachine.Notification.API.EventHandlers;

using SagaStateMachine.Notification.API.Infrastructure.Models;

public class OrderConfirmedEventHandler(NotificationDatabaseContext dbContext, ILogger<OrderConfirmedEventHandler> logger) : IConsumer<OrderConfirmed>
{
    private readonly NotificationDatabaseContext _dbContext = dbContext;

    private readonly ILogger<OrderConfirmedEventHandler> _logger = logger;

    public async Task Consume(ConsumeContext<OrderConfirmed> context)
    {
        _logger.LogInformation("Order confirmed for order {OrderId}", context.Message.OrderId);

        var notification = new Notification
        {
            OrderId = context.Message.OrderId,
            Message = "Order confirmed",
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Notifications.Add(notification);

        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Notification created for order {OrderId}", context.Message.OrderId);
    }
}