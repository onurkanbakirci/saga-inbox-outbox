var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();

// Add Entity Framework
builder.Services.AddDbContext<PaymentDatabaseContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Postgres")));

builder.Services.AddMassTransit(masstransitConfiguration =>
{
    masstransitConfiguration.AddConsumer<ProcessPaymentEventHandler>();

    // Configure outbox for reliable message publishing
    masstransitConfiguration.AddEntityFrameworkOutbox<PaymentDatabaseContext>(outboxConfiguration =>
    {
        outboxConfiguration.UsePostgres();
        outboxConfiguration.UseBusOutbox();
    });

    // Configure outbox for all endpoints
    masstransitConfiguration.AddConfigureEndpointsCallback((context, name, cfg) =>
    {
        cfg.UseEntityFrameworkOutbox<PaymentDatabaseContext>(context);
    });

    masstransitConfiguration.UsingRabbitMq((context, config) =>
    {
        config.Host(builder.Configuration.GetConnectionString("RabbitMQ"));
        
        // Configure message retry
        config.UseMessageRetry(r => r.Intervals(100, 200, 500, 800, 1000));
        
        config.ConfigureEndpoints(context);
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.MapControllers();

app.Run();