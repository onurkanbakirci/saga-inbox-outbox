using SagaStateMachine.Payment.API.Behaviors;

namespace SagaStateMachine.Payment.API.Extensions;

public static class BehaviorExtensions
{
    public static void AddBehaviors(this IServiceCollection services)
    {
        services.AddScoped(typeof(IPipelineBehavior<,>), typeof(TransactionBehavior<,>));
        services.AddScoped(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
    }
}