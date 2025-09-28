namespace SagaStateMachine.Inventory.API.Extensions;

public static class DatabaseExtension
{
    public static void AddDatabase(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<InventoryDatabaseContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("Postgres")));
    }
}