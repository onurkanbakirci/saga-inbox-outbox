using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace SagaStateMachine.Order.API.Infrastructure.Configurations;

using SagaStateMachine.Order.API.Infrastructure.Models;

public class OrderConfigurations : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.ProductId).IsRequired();

        builder.Property(x => x.Total).IsRequired();

        builder.Property(x => x.Email).IsRequired();
        
        builder.Property(x => x.OrderDate).IsRequired();

        builder.Property(x => x.PaymentIntentId).IsRequired();

        builder.Property(x => x.CompletedAt).IsRequired();

        builder.Property(x => x.IsCompleted).IsRequired();
        
        builder.Property(x => x.CurrentState).IsRequired();
    }
}