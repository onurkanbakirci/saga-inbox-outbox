# Saga State Machine - Order Processing System

A distributed order processing system implementing the **Saga Pattern** with **Outbox/Inbox Pattern** using **MassTransit** state machines. This system demonstrates how to handle complex business transactions across multiple microservices while maintaining data consistency, handling failures gracefully, and ensuring reliable message delivery.

## 🏗️ System Architecture

```mermaid
graph TB
    Client[Client Application] --> OrderAPI[Order API<br/>Port: 5001<br/>Saga Orchestrator]
    
    OrderAPI --> RabbitMQ[RabbitMQ Message Bus]
    PaymentAPI[Payment API<br/>Port: 5002] --> RabbitMQ
    InventoryAPI[Inventory API<br/>Port: 5003] --> RabbitMQ
    NotificationAPI[Notification API<br/>Port: 5004] --> RabbitMQ
    
    OrderAPI --> PostgreSQL[(PostgreSQL<br/>Saga State + Outbox)]
    PaymentAPI --> PaymentDB[(PostgreSQL<br/>Payment Data + Outbox)]
    InventoryAPI --> InventoryDB[(PostgreSQL<br/>Inventory Data + Outbox)]
    NotificationAPI --> NotificationDB[(PostgreSQL<br/>Notification Data + Outbox)]
    
    subgraph "Microservices with Outbox Pattern"
        OrderAPI
        PaymentAPI
        InventoryAPI
        NotificationAPI
    end
    
    subgraph "Infrastructure"
        RabbitMQ
        PostgreSQL
        PaymentDB
        InventoryDB
        NotificationDB
    end
    
    style OrderAPI fill:#e1f5fe
    style PaymentAPI fill:#f3e5f5
    style InventoryAPI fill:#e8f5e8
    style NotificationAPI fill:#fff8e1
    style RabbitMQ fill:#fff3e0
    style PostgreSQL fill:#fce4ec
```

## 🔄 Saga State Machine Flow

```mermaid
stateDiagram-v2
    [*] --> Initial
    Initial --> ProcessingPayment : OrderSubmitted /<br/>Publish ProcessPayment
    
    ProcessingPayment --> ReservingInventory : PaymentProcessed /<br/>Publish ReserveInventory
    ProcessingPayment --> Failed : OrderFailed /<br/>Payment Failed
    
    ReservingInventory --> Completed : InventoryReserved /<br/>Publish OrderConfirmed
    ReservingInventory --> Failed : OrderFailed /<br/>Publish RefundPayment
    
    Failed --> [*] : Finalized
    Completed --> [*] : Finalized
    
    note right of ProcessingPayment
        Payment processing with
        90% success rate
        Uses Outbox Pattern
    end note
    
    note right of ReservingInventory
        Inventory reservation with
        95% success rate
        Uses Outbox Pattern
    end note
    
    note right of Failed
        Compensating actions:
        - Refund payment if needed
        - Release inventory if reserved
        All via Outbox Pattern
    end note
```

## 📊 Message Flow Sequence with Outbox Pattern

```mermaid
sequenceDiagram
    participant C as Client
    participant O as Order API
    participant OB as Outbox
    participant P as Payment API
    participant I as Inventory API
    participant N as Notification API
    participant R as RabbitMQ
    participant DB as PostgreSQL
    
    C->>O: POST /api/v1/orders
    O->>DB: Begin Transaction
    O->>DB: Create Saga Instance
    O->>OB: Store OrderSubmitted in Outbox
    O->>DB: Commit Transaction
    O->>C: Return OrderId
    
    OB->>R: Publish OrderSubmitted (Reliable)
    
    Note over O,DB: State: ProcessingPayment
    
    R->>P: ProcessPayment Event (Inbox)
    P->>P: Process Payment (90% success)
    
    alt Payment Success
        P->>OB: Store PaymentProcessed in Outbox
        P->>DB: Save Payment Data
        OB->>R: Publish PaymentProcessed (Reliable)
        
        R->>O: PaymentProcessed Event (Inbox)
        O->>DB: Update State: ReservingInventory
        O->>OB: Store ReserveInventory in Outbox
        OB->>R: Publish ReserveInventory (Reliable)
        
        R->>I: ReserveInventory Event (Inbox)
        I->>I: Check Inventory (95% success)
        
        alt Inventory Available
            I->>OB: Store InventoryReserved in Outbox
            I->>DB: Update Inventory
            OB->>R: Publish InventoryReserved (Reliable)
            
            R->>O: InventoryReserved Event (Inbox)
            O->>DB: Update State: Completed
            O->>OB: Store OrderConfirmed in Outbox
            OB->>R: Publish OrderConfirmed (Reliable)
            
            R->>N: OrderConfirmed Event (Inbox)
            N->>DB: Store Notification
            Note over O,DB: ✅ Order Successfully Completed
        else Inventory Not Available
            I->>OB: Store OrderFailed in Outbox
            OB->>R: Publish OrderFailed (Reliable)
            
            R->>O: OrderFailed Event (Inbox)
            O->>DB: Update State: Failed
            O->>OB: Store RefundPayment in Outbox
            OB->>R: Publish RefundPayment (Reliable)
            Note over O,DB: ❌ Order Failed - Refunding
        end
    else Payment Failed
        P->>OB: Store OrderFailed in Outbox
        OB->>R: Publish OrderFailed (Reliable)
        
        R->>O: OrderFailed Event (Inbox)
        O->>DB: Update State: Failed
        Note over O,DB: ❌ Order Failed - No Compensation Needed
    end
```

## 🏛️ Service Architecture

### Order API (Saga Orchestrator)
- **Port**: 5001
- **Responsibilities**:
  - Accept order requests from clients
  - Manage the saga state machine
  - Coordinate the entire order process
  - Store saga state in PostgreSQL
  - Implement outbox pattern for reliable message publishing
- **Key Components**:
  - `OrderStateMachine`: Defines the saga workflow
  - `OrderState`: Maintains saga instance data
  - `OrdersController`: REST API endpoint with transactional outbox
  - `OrderConfirmedEventHandler`: Handles order completion events

### Payment API
- **Port**: 5002
- **Responsibilities**:
  - Process payment transactions
  - Simulate payment gateway integration
  - 90% success rate for demonstration
  - Implement outbox pattern for reliable message publishing
- **Key Components**:
  - `ProcessPaymentEventHandler`: Handles payment processing with outbox
  - `Payment`: Domain model for payment data

### Inventory API
- **Port**: 5003
- **Responsibilities**:
  - Check and reserve inventory
  - Manage stock levels
  - 95% success rate for demonstration
  - Implement outbox pattern for reliable message publishing
- **Key Components**:
  - `ReserveInventoryEventHandler`: Handles inventory operations with outbox
  - `Inventory`: Domain model for inventory management

### Notification API
- **Port**: 5004
- **Responsibilities**:
  - Send notifications to customers
  - Store notification history
  - Handle order confirmation events
  - Implement outbox pattern for reliable message publishing
- **Key Components**:
  - `OrderConfirmedEventHandler`: Handles order confirmation notifications
  - `Notification`: Domain model for notification data

## 🔒 Outbox/Inbox Pattern Implementation

### Outbox Pattern
Each service implements the **Outbox Pattern** to ensure reliable message publishing:

```csharp
// Example from OrdersController
using var transaction = await _dbContext.Database.BeginTransactionAsync();

try
{
    // Publish message using outbox pattern - message stored in outbox table
    await _publishEndpoint.Publish(new OrderSubmitted { ... });
    
    // Save changes to persist the outbox message
    await _dbContext.SaveChangesAsync();
    
    // Commit transaction - triggers outbox message publishing
    await transaction.CommitAsync();
}
catch
{
    await transaction.RollbackAsync();
    throw;
}
```

**Benefits**:
- **Atomic Operations**: Database changes and message publishing happen atomically
- **Guaranteed Delivery**: Messages are persisted before publishing
- **Failure Recovery**: Unpublished messages are automatically retried
- **Consistency**: No lost messages due to service failures

### Inbox Pattern
Each service implements the **Inbox Pattern** for idempotent message processing:

**Benefits**:
- **Duplicate Detection**: Prevents processing the same message multiple times
- **Idempotency**: Safe to retry message processing
- **Consistency**: Maintains data integrity across service boundaries

### Database Schema
Each service database includes:
- **OutboxMessage**: Stores messages to be published
- **OutboxState**: Tracks outbox publishing state
- **InboxState**: Tracks processed messages for idempotency

## 📋 Message Contracts

### Events
- **OrderSubmitted**: Initiates the saga
- **ProcessPayment**: Command to process payment
- **PaymentProcessed**: Payment completed successfully
- **ReserveInventory**: Command to reserve inventory
- **InventoryReserved**: Inventory reserved successfully
- **OrderConfirmed**: Order completed successfully (triggers notification)
- **OrderFailed**: Order failed at any step
- **RefundPayment**: Compensating action for failed orders

### Enhanced Message Properties
All messages include:
- **OrderId**: Correlation identifier
- **ProductId**: Product being ordered
- **Email**: Customer email for notifications
- **Total**: Order amount
- **PaymentIntentId**: Payment reference
- **Timestamp**: Event occurrence time

## 🛠️ Technology Stack

- **.NET 10**: Modern C# development
- **MassTransit**: Message bus, saga orchestration, and outbox/inbox patterns
- **RabbitMQ**: Message broker
- **PostgreSQL**: Saga state persistence and outbox/inbox storage
- **Entity Framework Core**: ORM for database operations
- **Docker**: Containerization (optional)

## 🚀 Getting Started

### Prerequisites
- .NET 10 SDK
- PostgreSQL server
- RabbitMQ server

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd saga-state-machine
   ```

2. **Start infrastructure services**
   ```bash
   # Using Docker Compose (if available)
   docker-compose up -d postgres rabbitmq
   
   # Or start manually:
   # - PostgreSQL on localhost:5432
   # - RabbitMQ on localhost:5672
   ```

3. **Update connection strings**
   Update `appsettings.json` in each API project:
   ```json
   {
     "ConnectionStrings": {
       "Postgres": "Host=localhost;Database=SagaStateMachine;Username=postgres;Password=password",
       "RabbitMQ": "amqp://guest:guest@localhost:5672/"
     }
   }
   ```

4. **Run database migrations**
   ```bash
   # Order API (includes saga state and outbox tables)
   cd SagaStateMachine.Order.API
   dotnet ef database update
   
   # Payment API (includes outbox tables)
   cd ../SagaStateMachine.Payment.API
   dotnet ef database update
   
   # Inventory API (includes outbox tables)
   cd ../SagaStateMachine.Inventory.API
   dotnet ef database update
   
   # Notification API (includes outbox tables)
   cd ../SagaStateMachine.Notification.API
   dotnet ef database update
   ```

5. **Start all services**
   ```bash
   # Terminal 1: Order API (Saga Orchestrator)
   cd SagaStateMachine.Order.API
   dotnet run
   
   # Terminal 2: Payment API
   cd SagaStateMachine.Payment.API
   dotnet run
   
   # Terminal 3: Inventory API
   cd SagaStateMachine.Inventory.API
   dotnet run
   
   # Terminal 4: Notification API
   cd SagaStateMachine.Notification.API
   dotnet run
   ```

### Testing the System

1. **Create an order**
   ```bash
   curl -X POST http://localhost:5001/api/v1/orders \
     -H "Content-Type: application/json" \
     -d '{
       "total": 99.99,
       "productId": "550e8400-e29b-41d4-a716-446655440000",
       "email": "customer@example.com"
     }'
   ```

2. **Monitor logs**
   - Watch the console output of all four services
   - Observe the saga state transitions
   - See the message flow between services
   - Notice outbox pattern ensuring reliable delivery

3. **Check database tables**
   - Verify saga state persistence in Order API database
   - Check outbox/inbox tables for message tracking
   - Observe notification records in Notification API database

## 🔍 Key Features

### Saga Pattern Benefits
- **Distributed Transactions**: Coordinates operations across multiple services
- **Failure Handling**: Automatic compensation for failed transactions
- **State Persistence**: Saga state survives service restarts
- **Event-Driven**: Loose coupling between services

### Outbox/Inbox Pattern Benefits
- **Reliable Messaging**: Guarantees message delivery even during failures
- **Atomic Operations**: Database changes and message publishing are atomic
- **Idempotency**: Prevents duplicate message processing
- **Consistency**: Maintains data consistency across service boundaries
- **Resilience**: Automatic retry and recovery mechanisms

### Compensating Actions
- **Payment Refund**: Automatically refunds payment if inventory fails
- **State Recovery**: Saga can resume from any point after service restart
- **Message Recovery**: Outbox ensures no messages are lost during failures
- **Idempotency**: Handles duplicate messages gracefully

### Monitoring & Observability
- **Structured Logging**: Comprehensive logging throughout the flow
- **State Tracking**: Database persistence of saga states
- **Message Tracing**: Correlation IDs for end-to-end tracing
- **Outbox Monitoring**: Track message publishing status
- **Inbox Monitoring**: Track message processing status

## 🏗️ Project Structure

```
saga-state-machine/
├── SagaStateMachine.BuildingBlocks/     # Shared contracts and DTOs
│   └── Contracts/                       # Message contracts
├── SagaStateMachine.Order.API/          # Saga orchestrator service
│   ├── Controllers/V1/                  # REST API controllers
│   ├── EventHandlers/                   # Event handlers with inbox
│   ├── Infrastructure/Saga/             # State machine implementation
│   ├── Infrastructure/Migrations/       # Database migrations (saga + outbox)
│   └── Infrastructure/Models/           # Domain models
├── SagaStateMachine.Payment.API/        # Payment processing service
│   ├── EventHandlers/                   # Message handlers with outbox
│   ├── Infrastructure/Migrations/       # Database migrations (outbox)
│   └── Infrastructure/Models/           # Payment domain models
├── SagaStateMachine.Inventory.API/      # Inventory management service
│   ├── EventHandlers/                   # Message handlers with outbox
│   ├── Infrastructure/Migrations/       # Database migrations (outbox)
│   └── Infrastructure/Models/           # Inventory domain models
├── SagaStateMachine.Notification.API/   # Notification service
│   ├── EventHandlers/                   # Message handlers with outbox
│   ├── Infrastructure/Migrations/       # Database migrations (outbox)
│   └── Infrastructure/Models/           # Notification domain models
└── SagaStateMachine.sln                # Solution file
```

## 🔧 Advanced Configuration

### Outbox Configuration
```csharp
// Configure outbox for reliable message publishing
masstransitConfiguration.AddEntityFrameworkOutbox<OrderDatabaseContext>(outboxConfiguration =>
{
    outboxConfiguration.UsePostgres();
    outboxConfiguration.UseBusOutbox();
});

// Configure outbox for all endpoints
masstransitConfiguration.AddConfigureEndpointsCallback((context, name, cfg) =>
{
    cfg.UseEntityFrameworkOutbox<OrderDatabaseContext>(context);
});
```

### Message Retry Configuration
```csharp
// Configure message retry with exponential backoff
config.UseMessageRetry(r => r.Intervals(100, 200, 500, 800, 1000));
```

### Saga Concurrency
```csharp
// Configure pessimistic concurrency for saga state
configuration.ConcurrencyMode = ConcurrencyMode.Pessimistic;
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Ensure outbox/inbox patterns are properly implemented
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

*This project demonstrates advanced distributed system patterns including Saga Pattern and Outbox/Inbox Pattern using modern .NET technologies. It serves as a reference implementation for building resilient, scalable microservices architectures with guaranteed message delivery and data consistency.*