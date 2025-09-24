namespace SagaStateMachine.Order.API.Dtos;

public class CreateOrderDto
{
    public decimal Total { get; set; }
    public string Email { get; set; }
}