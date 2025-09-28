namespace SagaStateMachine.Notification.API.Extensions;

public static class DatabaseExtension
{
    public static void AddDatabase(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<NotificationDatabaseContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("Postgres")));
    }
}