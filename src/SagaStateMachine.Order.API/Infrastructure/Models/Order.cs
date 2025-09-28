namespace SagaStateMachine.Order.API.Infrastructure.Models;

public class Order
{
    public Guid Id { get; set; }
    public string ProductId { get; set; }
    public decimal Total { get; set; }
    public string Email { get; set; }
    public DateTime OrderDate { get; set; }
    public string PaymentIntentId { get; set; }
    public DateTime? CompletedAt { get; set; }
    public bool IsCompleted { get; set; }
    public string CurrentState { get; set; }
}