using Microsoft.AspNetCore.Mvc;
using SagaStateMachine.BuildingBlocks.Contracts;
using SagaStateMachine.Order.API.Dtos;
using SagaStateMachine.Order.API.Infrastructure;

namespace SagaStateMachine.Order.API.Controllers.V1;

[ApiController]
[Route("api/v1/orders")]
public class OrdersController(IPublishEndpoint publishEndpoint, OrderDatabaseContext dbContext) : ControllerBase
{
    private readonly IPublishEndpoint _publishEndpoint = publishEndpoint;
    private readonly OrderDatabaseContext _dbContext = dbContext;

    [HttpPost]
    public async Task<IActionResult> CreateOrder(CreateOrderDto request)
    {
        var orderId = Guid.NewGuid();

        // Publish message using outbox pattern - message will be stored in outbox table
        // and published reliably after transaction commits
        await _publishEndpoint.Publish(new OrderSubmitted
        {
            OrderId = orderId,
            Total = request.Total,
            ProductId = request.ProductId,
            Email = request.Email
        });

        // Commit transaction - this will also trigger outbox message publishing
        await _dbContext.SaveChangesAsync();

        return Ok(new { OrderId = orderId });
    }
}