using SagaStateMachine.BuildingBlocks.Contracts;

namespace SagaStateMachine.Payment.API.EventHandlers;

using SagaStateMachine.Payment.API.Infrastructure.Models;

public class ProcessPaymentEventHandler(
    ILogger<ProcessPaymentEventHandler> logger,
    PaymentDatabaseContext dbContext) : IConsumer<ProcessPayment>
{
    private readonly ILogger<ProcessPaymentEventHandler> _logger = logger;
    private readonly PaymentDatabaseContext _dbContext = dbContext;

    public async Task Consume(ConsumeContext<ProcessPayment> context)
    {
        try
        {
            var payment = new Payment(context.Message.OrderId, context.Message.Amount);

            _dbContext.Payments.Add(payment);

            await context.Publish(new PaymentProcessed
            {
                OrderId = context.Message.OrderId,
                PaymentIntentId = payment.Id.ToString()
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