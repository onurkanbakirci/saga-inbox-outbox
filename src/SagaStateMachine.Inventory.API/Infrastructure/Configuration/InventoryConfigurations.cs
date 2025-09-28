namespace SagaStateMachine.Inventory.API.Infrastructure.Configuration;

using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SagaStateMachine.Inventory.API.Infrastructure.Models;

public class InventoryConfigurations : IEntityTypeConfiguration<Inventory>
{
    public void Configure(EntityTypeBuilder<Inventory> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.ProductId).IsRequired();

        builder.Property(x => x.Quantity).IsRequired();
    }
}