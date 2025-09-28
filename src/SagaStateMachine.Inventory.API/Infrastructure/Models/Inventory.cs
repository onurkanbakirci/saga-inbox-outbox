namespace SagaStateMachine.Inventory.API.Infrastructure.Models;

public class Inventory(Guid productId, int quantity)
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProductId { get; set; } = productId;
    public int Quantity { get; set; } = quantity;

    public void ReserveInventory()
    {
        Quantity -= 1;
    }
}