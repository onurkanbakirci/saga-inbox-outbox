namespace SagaStateMachine.Notification.API.Extensions;

using SagaStateMachine.Notification.API.Infrastructure.Models;

public static class SeedExtension
{
    public static void Seed(this IApplicationBuilder app)
    {
        using var scope = app.ApplicationServices.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<NotificationDatabaseContext>();

        context.Database.Migrate();
    }
}