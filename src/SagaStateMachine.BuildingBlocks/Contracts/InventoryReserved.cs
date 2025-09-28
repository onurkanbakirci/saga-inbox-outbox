namespace SagaStateMachine.BuildingBlocks.Contracts;

public record InventoryReserved
{
    public Guid OrderId { get; init; }
}