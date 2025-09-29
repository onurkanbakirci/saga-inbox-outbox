namespace SagaStateMachine.BuildingBlocks.Contracts;

public record OrderFailed
{
    public Guid OrderId { get; init; }
    public string? Reason { get; init; }
}