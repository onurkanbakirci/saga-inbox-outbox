namespace SagaStateMachine.BuildingBlocks.Contracts;

public record PaymentProcessed
{
    public Guid OrderId { get; init; }
    public required string PaymentIntentId { get; init; }
}