using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace SagaStateMachine.Notification.API.Infrastructure.Configurations;

using SagaStateMachine.Notification.API.Infrastructure.Models;

public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.HasKey(x => x.OrderId);

        builder.Property(x => x.Message).IsRequired();

        builder.Property(x => x.CreatedAt).IsRequired();
    }
}