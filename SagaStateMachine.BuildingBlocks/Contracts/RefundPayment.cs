namespace SagaStateMachine.BuildingBlocks.Contracts;

public record RefundPayment
{
    public Guid OrderId { get; init; }
    public decimal Amount { get; init; }
}