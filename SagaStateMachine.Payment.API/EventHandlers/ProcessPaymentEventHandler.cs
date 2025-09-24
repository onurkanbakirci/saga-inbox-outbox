using SagaStateMachine.BuildingBlocks.Contracts;

namespace SagaStateMachine.Payment.API.EventHandlers;

public class ProcessPaymentEventHandler(ILogger<ProcessPaymentEventHandler> logger, IPublishEndpoint publishEndpoint) : IConsumer<ProcessPayment>
{
    private readonly ILogger<ProcessPaymentEventHandler> _logger = logger;
    private readonly IPublishEndpoint _publishEndpoint = publishEndpoint;

    public async Task Consume(ConsumeContext<ProcessPayment> context)
    {
        _logger.LogInformation("Processing payment for order: {OrderId}", context.Message.OrderId);

        // Simulate payment processing
        await Task.Delay(1000);

        // 90% success rate
        if (Random.Shared.Next(100) < 90)
        {
            await _publishEndpoint.Publish(new PaymentProcessed
            {
                OrderId = context.Message.OrderId,
                PaymentIntentId = $"pi_{Guid.NewGuid():N}"
            });
        }
        else
        {
            await _publishEndpoint.Publish(new OrderFailed
            {
                OrderId = context.Message.OrderId,
                Reason = "Payment failed"
            });
        }
    }
}