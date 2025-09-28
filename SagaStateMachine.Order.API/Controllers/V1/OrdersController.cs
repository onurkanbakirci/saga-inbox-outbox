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

        // Start a database transaction for the outbox pattern
        using var transaction = await _dbContext.Database.BeginTransactionAsync();

        try
        {
            // Publish message using outbox pattern - message will be stored in outbox table
            // and published reliably after transaction commits
            await _publishEndpoint.Publish(new OrderSubmitted
            {
                OrderId = orderId,
                Total = request.Total,
                ProductId = request.ProductId,
                Email = request.Email
            });

            // Save changes to persist the outbox message
            await _dbContext.SaveChangesAsync();

            // Commit transaction - this will also trigger outbox message publishing
            await transaction.CommitAsync();

            return Ok(new { OrderId = orderId });
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }
}