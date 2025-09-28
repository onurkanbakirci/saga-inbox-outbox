namespace SagaStateMachine.Order.API.Extensions;

public static class OpenTelemetryExtension
{
    public static void AddCustomeOpenTelemetry(this IServiceCollection services, IConfiguration configuration)
    {
        var serviceName = configuration["OpenTelemetry:ServiceName"] ?? throw new ArgumentNullException("OpenTelemetry:ServiceName");
        var serviceVersion = configuration["OpenTelemetry:ServiceVersion"] ?? throw new ArgumentNullException("OpenTelemetry:ServiceVersion");
        var tracingEndpoint = configuration["OpenTelemetry:Tracing:OtlpExporter:Endpoint"] ?? throw new ArgumentNullException("OpenTelemetry:Tracing:OtlpExporter:Endpoint");
        var metricsEndpoint = configuration["OpenTelemetry:Metrics:OtlpExporter:Endpoint"] ?? throw new ArgumentNullException("OpenTelemetry:Metrics:OtlpExporter:Endpoint");
        var loggingEndpoint = configuration["OpenTelemetry:Logging:OtlpExporter:Endpoint"] ?? throw new ArgumentNullException("OpenTelemetry:Logging:OtlpExporter:Endpoint");

        services.AddOpenTelemetry()
            .ConfigureResource(r => r.AddService(serviceName, serviceVersion: serviceVersion, serviceInstanceId: Environment.MachineName))
            .WithTracing(b => b
                .AddSource(DiagnosticHeaders.DefaultListenerName) // MassTransit ActivitySource
                .AddAspNetCoreInstrumentation()
                .AddHttpClientInstrumentation()
                .AddEntityFrameworkCoreInstrumentation(options =>
                {
                    options.SetDbStatementForText = true;
                    options.SetDbStatementForStoredProcedure = true;
                })
                .AddOtlpExporter(options =>
                {
                    options.Endpoint = new Uri(tracingEndpoint);
                    options.Protocol = OpenTelemetry.Exporter.OtlpExportProtocol.Grpc;
                })
            )
            .WithMetrics(b => b
                .AddMeter(InstrumentationOptions.MeterName) // MassTransit Meter
                .AddAspNetCoreInstrumentation()
                .AddHttpClientInstrumentation()
                .AddMeter("Npgsql") // PostgreSQL metrics
                .AddOtlpExporter(options =>
                {
                    options.Endpoint = new Uri(metricsEndpoint);
                    options.Protocol = OpenTelemetry.Exporter.OtlpExportProtocol.Grpc;
                })
            )
            .WithLogging(b => b
                .AddOtlpExporter(options =>
                {
                    options.Endpoint = new Uri(loggingEndpoint);
                    options.Protocol = OpenTelemetry.Exporter.OtlpExportProtocol.Grpc;
                })
            );
    }
}