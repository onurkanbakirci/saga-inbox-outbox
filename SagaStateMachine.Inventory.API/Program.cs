var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddCustomeOpenTelemetry(builder.Configuration);

builder.Services.AddDatabase(builder.Configuration);

builder.Services.AddMasstransit(builder.Configuration);

var app = builder.Build();

app.Seed();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.MapControllers();

app.Run();