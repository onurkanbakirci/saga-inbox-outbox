# Saga State Machine - Order Processing System

A distributed order processing system implementing the **Saga Pattern** using **MassTransit** state machines. This system demonstrates how to handle complex business transactions across multiple microservices while maintaining data consistency and handling failures gracefully.

## 🏗️ System Architecture

```mermaid
graph TB
    Client[Client Application] --> OrderAPI[Order API<br/>Port: 5001]
    
    OrderAPI --> RabbitMQ[RabbitMQ Message Bus]
    PaymentAPI[Payment API<br/>Port: 5002] --> RabbitMQ
    InventoryAPI[Inventory API<br/>Port: 5003] --> RabbitMQ
    
    OrderAPI --> PostgreSQL[(PostgreSQL<br/>Saga State Storage)]
    
    subgraph "Microservices"
        OrderAPI
        PaymentAPI
        InventoryAPI
    end
    
    subgraph "Infrastructure"
        RabbitMQ
        PostgreSQL
    end
    
    style OrderAPI fill:#e1f5fe
    style PaymentAPI fill:#f3e5f5
    style InventoryAPI fill:#e8f5e8
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
    end note
    
    note right of ReservingInventory
        Inventory reservation with
        95% success rate
    end note
    
    note right of Failed
        Compensating actions:
        - Refund payment if needed
        - Release inventory if reserved
    end note
```

## 📊 Message Flow Sequence

```mermaid
sequenceDiagram
    participant C as Client
    participant O as Order API
    participant P as Payment API
    participant I as Inventory API
    participant R as RabbitMQ
    participant DB as PostgreSQL
    
    C->>O: POST /api/v1/orders
    O->>DB: Create Saga Instance
    O->>R: Publish OrderSubmitted
    O->>C: Return OrderId
    
    Note over O,DB: State: ProcessingPayment
    
    R->>P: ProcessPayment Event
    P->>P: Process Payment (90% success)
    
    alt Payment Success
        P->>R: Publish PaymentProcessed
        R->>O: PaymentProcessed Event
        O->>DB: Update State: ReservingInventory
        O->>R: Publish ReserveInventory
        
        R->>I: ReserveInventory Event
        I->>I: Check Inventory (95% success)
        
        alt Inventory Available
            I->>R: Publish InventoryReserved
            R->>O: InventoryReserved Event
            O->>DB: Update State: Completed
            O->>R: Publish OrderConfirmed
            Note over O,DB: ✅ Order Successfully Completed
        else Inventory Not Available
            I->>R: Publish OrderFailed
            R->>O: OrderFailed Event
            O->>DB: Update State: Failed
            O->>R: Publish RefundPayment
            Note over O,DB: ❌ Order Failed - Refunding
        end
    else Payment Failed
        P->>R: Publish OrderFailed
        R->>O: OrderFailed Event
        O->>DB: Update State: Failed
        Note over O,DB: ❌ Order Failed - No Compensation Needed
    end
```

## 🏛️ Service Architecture

### Order API (Orchestrator)
- **Port**: 5001
- **Responsibilities**:
  - Accept order requests from clients
  - Manage the saga state machine
  - Coordinate the entire order process
  - Store saga state in PostgreSQL
- **Key Components**:
  - `OrderStateMachine`: Defines the saga workflow
  - `OrderState`: Maintains saga instance data
  - `OrdersController`: REST API endpoint

### Payment API
- **Port**: 5002
- **Responsibilities**:
  - Process payment transactions
  - Simulate payment gateway integration
  - 90% success rate for demonstration
- **Key Components**:
  - `ProcessPaymentEventHandler`: Handles payment processing

### Inventory API
- **Port**: 5003
- **Responsibilities**:
  - Check and reserve inventory
  - Manage stock levels
  - 95% success rate for demonstration
- **Key Components**:
  - `ReserveInventoryEventHandler`: Handles inventory operations

## 📋 Message Contracts

### Events
- **OrderSubmitted**: Initiates the saga
- **ProcessPayment**: Command to process payment
- **PaymentProcessed**: Payment completed successfully
- **ReserveInventory**: Command to reserve inventory
- **InventoryReserved**: Inventory reserved successfully
- **OrderConfirmed**: Order completed successfully
- **OrderFailed**: Order failed at any step
- **RefundPayment**: Compensating action for failed orders

## 🛠️ Technology Stack

- **.NET 10**: Modern C# development
- **MassTransit**: Message bus and saga orchestration
- **RabbitMQ**: Message broker
- **PostgreSQL**: Saga state persistence
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
   cd SagaStateMachine.Order.API
   dotnet ef database update
   ```

5. **Start all services**
   ```bash
   # Terminal 1: Order API
   cd SagaStateMachine.Order.API
   dotnet run
   
   # Terminal 2: Payment API
   cd SagaStateMachine.Payment.API
   dotnet run
   
   # Terminal 3: Inventory API
   cd SagaStateMachine.Inventory.API
   dotnet run
   ```

### Testing the System

1. **Create an order**
   ```bash
   curl -X POST http://localhost:5001/api/v1/orders \
     -H "Content-Type: application/json" \
     -d '{
       "total": 99.99,
       "email": "customer@example.com"
     }'
   ```

2. **Monitor logs**
   - Watch the console output of all three services
   - Observe the saga state transitions
   - See the message flow between services

## 🔍 Key Features

### Saga Pattern Benefits
- **Distributed Transactions**: Coordinates operations across multiple services
- **Failure Handling**: Automatic compensation for failed transactions
- **State Persistence**: Saga state survives service restarts
- **Event-Driven**: Loose coupling between services

### Compensating Actions
- **Payment Refund**: Automatically refunds payment if inventory fails
- **State Recovery**: Saga can resume from any point after service restart
- **Idempotency**: Handles duplicate messages gracefully

### Monitoring & Observability
- **Structured Logging**: Comprehensive logging throughout the flow
- **State Tracking**: Database persistence of saga states
- **Message Tracing**: Correlation IDs for end-to-end tracing

## 🏗️ Project Structure

```
saga-state-machine/
├── SagaStateMachine.BuildingBlocks/     # Shared contracts and DTOs
│   └── Contracts/                       # Message contracts
├── SagaStateMachine.Order.API/          # Saga orchestrator service
│   ├── Controllers/V1/                  # REST API controllers
│   ├── Infrastructure/Saga/             # State machine implementation
│   └── Infrastructure/Migrations/       # Database migrations
├── SagaStateMachine.Payment.API/        # Payment processing service
│   └── EventHandlers/                   # Message handlers
├── SagaStateMachine.Inventory.API/      # Inventory management service
│   └── EventHandlers/                   # Message handlers
└── SagaStateMachine.sln                # Solution file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

*This project demonstrates advanced distributed system patterns using modern .NET technologies. It serves as a reference implementation for building resilient, scalable microservices architectures.*
