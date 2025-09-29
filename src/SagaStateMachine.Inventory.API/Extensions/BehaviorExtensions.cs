using SagaStateMachine.Inventory.API.Behaviors;

namespace SagaStateMachine.Inventory.API.Extensions;

public static class BehaviorExtensions
{
    public static void AddBehaviors(this IServiceCollection services)
    {
        services.AddScoped(typeof(IPipelineBehavior<,>), typeof(TransactionBehavior<,>));
        services.AddScoped(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
    }
}