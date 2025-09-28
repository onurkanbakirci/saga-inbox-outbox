using SagaStateMachine.BuildingBlocks.Contracts;

namespace SagaStateMachine.Notification.API.EventHandlers;

using SagaStateMachine.Notification.API.Infrastructure.Models;

public class OrderConfirmedEventHandler(
    ILogger<OrderConfirmedEventHandler> logger,
    NotificationDatabaseContext dbContext) : IConsumer<OrderConfirmed>
{
    private readonly ILogger<OrderConfirmedEventHandler> _logger = logger;
    private readonly NotificationDatabaseContext _dbContext = dbContext;

    public async Task Consume(ConsumeContext<OrderConfirmed> context)
    {
        var notification = new Notification
        {
            OrderId = context.Message.OrderId,
            Message = "Order confirmed",
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Notifications.Add(notification);

        await _dbContext.SaveChangesAsync();
    }
}