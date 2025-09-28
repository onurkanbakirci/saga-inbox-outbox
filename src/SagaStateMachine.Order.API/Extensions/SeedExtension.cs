namespace SagaStateMachine.Order.API.Extensions;

public static class SeedExtension
{
    public static void Seed(this IApplicationBuilder app)
    {
        using var scope = app.ApplicationServices.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<OrderDatabaseContext>();

        context.Database.Migrate();
    }
}