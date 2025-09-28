namespace SagaStateMachine.BuildingBlocks.Contracts;

public record ReserveInventory
{
    public Guid OrderId { get; init; }
    public Guid ProductId { get; init; }
}