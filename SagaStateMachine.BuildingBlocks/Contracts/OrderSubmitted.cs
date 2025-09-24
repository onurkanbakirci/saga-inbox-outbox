namespace SagaStateMachine.BuildingBlocks.Contracts;

public record OrderSubmitted
{
    public Guid OrderId { get; init; }
    public decimal Total { get; init; }
    public string Email { get; init; }
}