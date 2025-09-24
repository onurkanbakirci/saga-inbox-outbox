var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddDbContext<OrderDatabaseContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Postgres")));

builder.Services.AddMassTransit(masstransitConfiguration =>
{
    masstransitConfiguration.AddSagaStateMachine<OrderStateMachine, OrderState>()
        .EntityFrameworkRepository(configuration =>
        {
            configuration.ConcurrencyMode = ConcurrencyMode.Pessimistic;
            configuration.AddDbContext<DbContext, OrderDatabaseContext>();
            configuration.UsePostgres();
        });

    masstransitConfiguration.UsingRabbitMq((context, config) =>
    {
        config.Host(builder.Configuration.GetConnectionString("RabbitMQ"));
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