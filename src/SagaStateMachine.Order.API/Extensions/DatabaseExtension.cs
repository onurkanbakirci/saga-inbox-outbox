namespace SagaStateMachine.Order.API.Extensions;

public static class DatabaseExtension
{
    public static void AddDatabase(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<OrderDatabaseContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("Postgres")));
    }
}