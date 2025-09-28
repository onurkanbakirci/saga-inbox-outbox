namespace SagaStateMachine.Inventory.API.Extensions;

public static class MasstransitExtension
{
    public static void AddMasstransit(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddMassTransit(masstransitConfiguration =>
        {
            masstransitConfiguration.AddConsumers(typeof(Program).Assembly);

            // Configure outbox for reliable message publishing
            masstransitConfiguration.AddEntityFrameworkOutbox<InventoryDatabaseContext>(outboxConfiguration =>
            {
                outboxConfiguration.UsePostgres();
                outboxConfiguration.UseBusOutbox();
            });

            // Configure outbox for all endpoints
            masstransitConfiguration.AddConfigureEndpointsCallback((context, name, cfg) =>
            {
                cfg.UseEntityFrameworkOutbox<InventoryDatabaseContext>(context);
            });

            masstransitConfiguration.UsingRabbitMq((context, config) =>
            {
                config.Host(configuration.GetConnectionString("RabbitMQ"));

                // Configure message retry
                config.UseMessageRetry(r => r.Intervals(100, 200, 500, 800, 1000));

                config.ConfigureEndpoints(context);
            });
        });
    }
}