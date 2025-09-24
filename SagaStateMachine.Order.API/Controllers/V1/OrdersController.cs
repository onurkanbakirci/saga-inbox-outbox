using Microsoft.AspNetCore.Mvc;
using SagaStateMachine.BuildingBlocks.Contracts;
using SagaStateMachine.Order.API.Dtos;

namespace SagaStateMachine.Order.API.Controllers.V1;

[ApiController]
[Route("api/v1/orders")]
public class OrdersController(IPublishEndpoint publishEndpoint) : ControllerBase
{
    private readonly IPublishEndpoint _publishEndpoint = publishEndpoint;

    [HttpPost]
    public async Task<IActionResult> CreateOrder(CreateOrderDto request)
    {
        var orderId = Guid.NewGuid();

        await _publishEndpoint.Publish(new OrderSubmitted
        {
            OrderId = orderId,
            Total = request.Total,
            Email = request.Email
        });

        return Ok(new { OrderId = orderId });
    }
}