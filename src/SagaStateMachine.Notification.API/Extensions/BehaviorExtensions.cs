using SagaStateMachine.Notification.API.Behaviors;

namespace SagaStateMachine.Notification.API.Extensions;

public static class BehaviorExtensions
{
    public static void AddBehaviors(this IServiceCollection services)
    {
        services.AddScoped(typeof(IPipelineBehavior<,>), typeof(TransactionBehavior<,>));
        services.AddScoped(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
    }
}