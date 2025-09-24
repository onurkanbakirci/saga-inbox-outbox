namespace SagaStateMachine.BuildingBlocks.Contracts;

public record OrderConfirmed
{
    public Guid OrderId { get; init; }
}