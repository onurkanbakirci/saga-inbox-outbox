namespace SagaStateMachine.Payment.API.Infrastructure.Models;

public class Payment(Guid orderId, decimal amount)
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OrderId { get; set; } = orderId;
    public decimal Amount { get; set; } = amount;
}