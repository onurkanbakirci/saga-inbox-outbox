using SagaStateMachine.BuildingBlocks.Contracts;

namespace SagaStateMachine.Order.API.Infrastructure.Saga;

public class OrderStateMachine : MassTransitStateMachine<OrderState>
{
    public OrderStateMachine()
    {
        Event(() => OrderSubmitted, x => x.CorrelateById(m => m.Message.OrderId));
        Event(() => PaymentProcessed, x => x.CorrelateById(m => m.Message.OrderId));
        Event(() => InventoryReserved, x => x.CorrelateById(m => m.Message.OrderId));
        Event(() => OrderFailed, x => x.CorrelateById(m => m.Message.OrderId));

        InstanceState(x => x.CurrentState);

        Initially(
            When(OrderSubmitted)
                .Then(context =>
                {
                    context.Saga.OrderTotal = context.Message.Total;
                    context.Saga.CustomerEmail = context.Message.Email;
                    context.Saga.OrderDate = DateTime.UtcNow;
                })
                .PublishAsync(context => context.Init<ProcessPayment>(new
                {
                    OrderId = context.Saga.CorrelationId,
                    Amount = context.Saga.OrderTotal
                }))
                .TransitionTo(ProcessingPayment)
        );

        During(ProcessingPayment,
            When(PaymentProcessed)
                .PublishAsync(context => context.Init<ReserveInventory>(new
                {
                    OrderId = context.Saga.CorrelationId
                }))
                .TransitionTo(ReservingInventory),
            When(OrderFailed)
                .TransitionTo(Failed)
                .Finalize()
        );

        During(ReservingInventory,
            When(InventoryReserved)
                .PublishAsync(context => context.Init<OrderConfirmed>(new
                {
                    OrderId = context.Saga.CorrelationId
                }))
                .TransitionTo(Completed)
                .Finalize(),
            When(OrderFailed)
                .PublishAsync(context => context.Init<RefundPayment>(new
                {
                    OrderId = context.Saga.CorrelationId,
                    Amount = context.Saga.OrderTotal
                }))
                .TransitionTo(Failed)
                .Finalize()
        );

        SetCompletedWhenFinalized();
    }

    public State ProcessingPayment { get; private set; }
    public State ReservingInventory { get; private set; }
    public State Completed { get; private set; }
    public State Failed { get; private set; }

    public Event<OrderSubmitted> OrderSubmitted { get; private set; }
    public Event<PaymentProcessed> PaymentProcessed { get; private set; }
    public Event<InventoryReserved> InventoryReserved { get; private set; }
    public Event<OrderFailed> OrderFailed { get; private set; }
}