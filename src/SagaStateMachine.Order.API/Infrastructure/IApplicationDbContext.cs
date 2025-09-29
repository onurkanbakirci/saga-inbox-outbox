using Microsoft.EntityFrameworkCore.Storage;

namespace SagaStateMachine.Order.API.Infrastructure;

public interface IApplicationDbContext
{
    bool HasActiveTransaction { get; }

    DbContext Instance { get; }

    Task<IDbContextTransaction> BeginTransactionAsync();

    Task CommitTransactionAsync(IDbContextTransaction transaction);

    void RollbackTransaction();
}