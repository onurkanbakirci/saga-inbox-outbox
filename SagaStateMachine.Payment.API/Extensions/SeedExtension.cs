namespace SagaStateMachine.Payment.API.Extensions;

public static class SeedExtension
{
    public static void Seed(this IApplicationBuilder app)
    {
        using var scope = app.ApplicationServices.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<PaymentDatabaseContext>();

        context.Database.Migrate();
    }
}