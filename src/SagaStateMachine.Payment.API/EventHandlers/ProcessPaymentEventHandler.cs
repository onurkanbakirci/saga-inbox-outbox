using SagaStateMachine.BuildingBlocks.Contracts;

namespace SagaStateMachine.Payment.API.EventHandlers;

using SagaStateMachine.Payment.API.Infrastructure.Models;

public class ProcessPaymentEventHandler(PaymentDatabaseContext dbContext, ILogger<ProcessPaymentEventHandler> logger) : IConsumer<ProcessPayment>
{
    private readonly PaymentDatabaseContext _dbContext = dbContext;

    private readonly ILogger<ProcessPaymentEventHandler> _logger = logger;

    public async Task Consume(ConsumeContext<ProcessPayment> context)
    {
        _logger.LogInformation("Processing payment for order {OrderId}", context.Message.OrderId);

        try
        {
            var payment = new Payment(context.Message.OrderId, context.Message.Amount);

            _dbContext.Payments.Add(payment);

            // Publish success message - outbox pattern will handle transaction management
            await context.Publish(new PaymentProcessed
            {
                OrderId = context.Message.OrderId,
                PaymentIntentId = payment.Id.ToString()
            });

            // Save changes - outbox pattern will ensure this and message publishing happen atomically
            await _dbContext.SaveChangesAsync();

            _logger.LogInformation("Payment processed for order {OrderId}", context.Message.OrderId);
        }
        catch (Exception ex)
        {
            await context.Publish(new OrderFailed
            {
                OrderId = context.Message.OrderId,
                Reason = ex.Message
            });

            _logger.LogError(ex, "Error processing payment for order {OrderId}", context.Message.OrderId);

            // Let the exception bubble up so MassTransit can handle retry logic
            throw;
        }
    }
}