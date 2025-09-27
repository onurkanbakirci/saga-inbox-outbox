using MassTransit;
using SagaStateMachine.BuildingBlocks.Contracts;
using SagaStateMachine.Payment.API.Infrastructure;

namespace SagaStateMachine.Payment.API.EventHandlers;

public class ProcessPaymentEventHandler(
    ILogger<ProcessPaymentEventHandler> logger, 
    PaymentDatabaseContext dbContext) : IConsumer<ProcessPayment>
{
    private readonly ILogger<ProcessPaymentEventHandler> _logger = logger;
    private readonly PaymentDatabaseContext _dbContext = dbContext;

    public async Task Consume(ConsumeContext<ProcessPayment> context)
    {
        _logger.LogInformation("Processing payment for order: {OrderId}", context.Message.OrderId);

        // Simulate payment processing (business logic would go here)
        await Task.Delay(1000);

        // 90% success rate
        if (Random.Shared.Next(100) < 90)
        {
            // Publish message using outbox pattern - message will be stored in outbox table
            // and published reliably by the outbox delivery service
            await context.Publish(new PaymentProcessed
            {
                OrderId = context.Message.OrderId,
                PaymentIntentId = $"pi_{Guid.NewGuid():N}"
            });
            
            _logger.LogInformation("Payment processed successfully for order: {OrderId}", context.Message.OrderId);
        }
        else
        {
            // Publish failure message using outbox pattern
            await context.Publish(new OrderFailed
            {
                OrderId = context.Message.OrderId,
                Reason = "Payment failed"
            });
            
            _logger.LogWarning("Payment failed for order: {OrderId}", context.Message.OrderId);
        }
    }
}