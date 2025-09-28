namespace SagaStateMachine.Order.API.Extensions;

public static class MasstransitExtension
{
    public static void AddMasstransit(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddMassTransit(masstransitConfiguration =>
        {
            masstransitConfiguration.AddSagaStateMachine<OrderStateMachine, OrderState>()
         .EntityFrameworkRepository(configuration =>
         {
             configuration.ConcurrencyMode = ConcurrencyMode.Pessimistic;
             configuration.AddDbContext<DbContext, OrderDatabaseContext>();
             configuration.UsePostgres();
         });

            // Add event handlers
            masstransitConfiguration.AddConsumers(typeof(Program).Assembly);

            // Configure outbox
            masstransitConfiguration.AddEntityFrameworkOutbox<OrderDatabaseContext>(outboxConfiguration =>
            {
                outboxConfiguration.UsePostgres();
                outboxConfiguration.UseBusOutbox();
            });

            // Configure outbox for all endpoints
            masstransitConfiguration.AddConfigureEndpointsCallback((context, name, cfg) =>
            {
                cfg.UseEntityFrameworkOutbox<OrderDatabaseContext>(context);
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