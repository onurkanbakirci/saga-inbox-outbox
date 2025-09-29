namespace SagaStateMachine.Order.API.Infrastructure.Models;

public class Order
{
    public Guid Id { get; set; }
    public required string ProductId { get; set; }
    public decimal Total { get; set; }
    public required string Email { get; set; }
    public DateTime OrderDate { get; set; }
    public required string PaymentIntentId { get; set; }
    public DateTime? CompletedAt { get; set; }
    public bool IsCompleted { get; set; }
    public required string CurrentState { get; set; }
}