namespace SagaStateMachine.BuildingBlocks.Contracts;

public record ProcessPayment
{
    public Guid OrderId { get; init; }
    public decimal Amount { get; init; }
}