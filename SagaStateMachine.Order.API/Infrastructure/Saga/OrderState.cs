namespace SagaStateMachine.Order.API.Infrastructure.Saga;

public class OrderState : SagaStateMachineInstance
{
    public Guid CorrelationId { get; set; }
    public string CurrentState { get; set; }
    public decimal OrderTotal { get; set; }
    public string? ProductId { get; set; }
    public string? PaymentIntentId { get; set; }
    public DateTime? OrderDate { get; set; }
    public string? CustomerEmail { get; set; }
}