using SagaStateMachine.BuildingBlocks.Contracts;

namespace SagaStateMachine.Order.API.EventHandlers;

using SagaStateMachine.Order.API.Infrastructure.Models;

public class OrderConfirmedEventHandler(OrderDatabaseContext context) : IConsumer<OrderConfirmed>
{
    private readonly OrderDatabaseContext _context = context;

    public async Task Consume(ConsumeContext<OrderConfirmed> context)
    {
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
        }
        catch (Exception ex)
        {
            throw;
        }
    }
}
