namespace SagaStateMachine.Inventory.API.Extensions;

using SagaStateMachine.Inventory.API.Infrastructure.Models;

public static class SeedExtension
{
    public static void Seed(this IApplicationBuilder app)
    {
        using var scope = app.ApplicationServices.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<InventoryDatabaseContext>();
        SeedData(context);
    }

    private static void SeedData(InventoryDatabaseContext context)
    {
        context.Inventories.Add(new Inventory(new Guid("b3fed189-f0fd-409b-8b5c-ae2f8a6fae9d"), 100));
        context.Inventories.Add(new Inventory(new Guid("571636d2-ca65-433d-8746-507a1e539ae9"), 100));
        context.SaveChanges();
    }
}