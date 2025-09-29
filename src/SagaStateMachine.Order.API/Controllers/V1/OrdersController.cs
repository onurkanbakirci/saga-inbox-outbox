using Microsoft.AspNetCore.Mvc;
using SagaStateMachine.Order.API.Dtos;
using SagaStateMachine.Order.API.Features.Commands;

namespace SagaStateMachine.Order.API.Controllers.V1;

[ApiController]
[Route("api/v1/orders")]
public class OrdersController(IMediator mediator) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> CreateOrder(CreateOrderDto request)
    {
        var command = new CreateOrderCommand { Request = request };
        var orderId = await mediator.Send(command);
        return Ok(new { OrderId = orderId });
    }
}