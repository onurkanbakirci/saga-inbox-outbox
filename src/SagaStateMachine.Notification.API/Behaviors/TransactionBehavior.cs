namespace SagaStateMachine.Notification.API.Behaviors;

public class TransactionBehavior<TRequest, TResponse>(NotificationDatabaseContext context) : IPipelineBehavior<TRequest, TResponse>
{
    private readonly NotificationDatabaseContext _context = context;

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {   
        using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);

        try
        {
            var response = await next();

            await transaction.CommitAsync(cancellationToken);

            return response;
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }
}