namespace SagaStateMachine.BuildingBlocks.Contracts;

public record OrderConfirmed
{
    public Guid OrderId { get; init; }

    public string ProductId { get; init; }

    public string Email { get; init; }

    public decimal Total { get; init; }

    public DateTime OrderDate { get; init; }

    public string PaymentIntentId { get; init; }
}