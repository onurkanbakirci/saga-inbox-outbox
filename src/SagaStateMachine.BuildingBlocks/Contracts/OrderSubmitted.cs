namespace SagaStateMachine.BuildingBlocks.Contracts;

public record OrderSubmitted
{
    public Guid OrderId { get; init; }
    public decimal Total { get; init; }
    public Guid ProductId { get; init; }
    public required string Email { get; init; }
}