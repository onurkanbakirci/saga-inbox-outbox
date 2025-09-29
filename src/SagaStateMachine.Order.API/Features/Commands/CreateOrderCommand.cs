using SagaStateMachine.BuildingBlocks.Contracts;
using SagaStateMachine.Order.API.Dtos;

namespace SagaStateMachine.Order.API.Features.Commands;

public class CreateOrderCommand : IRequest<Guid>
{
    public required CreateOrderDto Request { get; set; }

    public class CreateOrderCommandHandler(IPublishEndpoint publishEndpoint, OrderDatabaseContext dbContext) : IRequestHandler<CreateOrderCommand, Guid>
    {
        private readonly OrderDatabaseContext _dbContext = dbContext;

        private readonly IPublishEndpoint _publishEndpoint = publishEndpoint;

        public async Task<Guid> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
        {
            var orderId = Guid.NewGuid();

            // Publish message using outbox pattern - message will be stored in outbox table
            // and published reliably after transaction commits
            await _publishEndpoint.Publish(new OrderSubmitted
            {
                OrderId = orderId,
                Total = request.Request.Total,
                ProductId = request.Request.ProductId,
                Email = request.Request.Email
            }, cancellationToken);

            await _dbContext.SaveChangesAsync(cancellationToken);

            return orderId;
        }
    }
}

