using SagaStateMachine.Order.API.Behaviors;

namespace SagaStateMachine.Order.API.Extensions;

public static class BehaviorExtension
{
    public static void AddBehaviors(this IServiceCollection services)
    {
        services.AddScoped(typeof(IPipelineBehavior<,>), typeof(TransactionBehavior<,>));
        services.AddScoped(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
    }
}