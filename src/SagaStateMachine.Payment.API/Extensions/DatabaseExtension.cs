namespace SagaStateMachine.Payment.API.Extensions;

public static class DatabaseExtension
{
    public static void AddDatabase(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<PaymentDatabaseContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("Postgres")));
    }
}