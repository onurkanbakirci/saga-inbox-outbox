namespace SagaStateMachine.BuildingBlocks.Contracts;

public record PaymentProcessed
{
    public Guid OrderId { get; init; }
    public string PaymentIntentId { get; init; }
}