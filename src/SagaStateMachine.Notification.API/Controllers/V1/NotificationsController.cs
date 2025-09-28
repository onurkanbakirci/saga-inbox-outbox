using Microsoft.AspNetCore.Mvc;

namespace SagaStateMachine.Notification.API.Controllers.V1;

[ApiController]
[Route("api/v1/notifications")]
public class NotificationsController : ControllerBase
{
    [HttpGet]
    public IActionResult GetNotifications()
    {
        return Ok();
    }
}