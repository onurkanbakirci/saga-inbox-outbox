using Microsoft.AspNetCore.Mvc;

namespace SagaStateMachine.Payment.API.Controllers.V1;

[ApiController]
[Route("api/v1/payments")]
public class PaymentsController : ControllerBase
{
    [HttpGet]
    public IActionResult GetPayments()
    {
        return Ok();
    }
}