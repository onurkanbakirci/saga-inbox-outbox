namespace SagaStateMachine.BuildingBlocks.Contracts;

public record ReserveInventory
{
    public Guid OrderId { get; init; }
}