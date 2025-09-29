using SagaStateMachine.BuildingBlocks.Contracts;

namespace SagaStateMachine.Order.API.EventHandlers;

using SagaStateMachine.Order.API.Infrastructure.Models;

public class OrderConfirmedEventHandler(OrderDatabaseContext context, ILogger<OrderConfirmedEventHandler> logger) : IConsumer<OrderConfirmed>
{
    private readonly OrderDatabaseContext _context = context;

    private readonly ILogger<OrderConfirmedEventHandler> _logger = logger;

    public async Task Consume(ConsumeContext<OrderConfirmed> context)
    {
        _logger.LogInformation("Order confirmed for order {OrderId}", context.Message.OrderId);

        var orderConfirmed = context.Message;

        try
        {
            // Create new order record
            var order = new Order
            {
                Id = orderConfirmed.OrderId,
                ProductId = orderConfirmed.ProductId,
                Total = orderConfirmed.Total,
                Email = orderConfirmed.Email,
                OrderDate = orderConfirmed.OrderDate,
                PaymentIntentId = orderConfirmed.PaymentIntentId,
                CompletedAt = DateTime.UtcNow,
                IsCompleted = true,
                CurrentState = "Completed"
            };

            _context.Orders.Add(order);

            await _context.SaveChangesAsync();

            _logger.LogInformation("Order confirmed for order {OrderId}", context.Message.OrderId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error confirming order for order {OrderId}", context.Message.OrderId);

            throw;
        }
    }
}
