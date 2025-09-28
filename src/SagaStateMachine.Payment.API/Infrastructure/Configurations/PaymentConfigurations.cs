namespace SagaStateMachine.Payment.API.Infrastructure.Configurations;

using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SagaStateMachine.Payment.API.Infrastructure.Models;

public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.OrderId).IsRequired();

        builder.Property(x => x.Amount).IsRequired();
    }
}