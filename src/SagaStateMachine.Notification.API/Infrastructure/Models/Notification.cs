namespace SagaStateMachine.Notification.API.Infrastructure.Models;

public class Notification
{
    public Guid OrderId { get; set; }
    public string Message { get; set; }
    public DateTime CreatedAt { get; set; }
}