namespace SagaStateMachine.Order.API.Behaviors;

public class TransactionBehavior<TRequest, TResponse>(IApplicationDbContext applicationDbContext) : IPipelineBehavior<TRequest, TResponse>
{
    private readonly IApplicationDbContext _applicationDbContext = applicationDbContext;

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        var response = default(TResponse);

        try
        {
            var strategy = _applicationDbContext.Instance.Database.CreateExecutionStrategy();

            return await strategy.ExecuteAsync(async () =>
            {
                await using var transaction = await _applicationDbContext.BeginTransactionAsync();

                var response = await next();

                await _applicationDbContext.CommitTransactionAsync(transaction);

                return response;
            });
        }
        catch (Exception)
        {
            throw;
        }
    }
}