namespace SagaStateMachine.BuildingBlocks.Contracts;

public record OrderConfirmed
{
    public Guid OrderId { get; init; }

    public required string ProductId { get; init; }

    public required string Email { get; init; }

    public decimal Total { get; init; }

    public DateTime OrderDate { get; init; }

    public required string PaymentIntentId { get; init; }
}