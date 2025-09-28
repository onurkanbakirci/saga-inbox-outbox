using Microsoft.AspNetCore.Mvc;

namespace SagaStateMachine.Inventory.API.Controllers.V1;

[ApiController]
[Route("api/v1/inventories")]
public class InventoriesController : ControllerBase
{
    [HttpGet]
    public IActionResult GetInventories()
    {
        return Ok();
    }
}