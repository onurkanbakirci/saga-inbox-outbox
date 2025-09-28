# Saga State Machine - Order Processing System

A distributed order processing system implementing the **Saga Pattern** with **Outbox/Inbox Pattern** using **MassTransit** state machines. This system demonstrates how to handle complex business transactions across multiple microservices while maintaining data consistency, handling failures gracefully, and ensuring reliable message delivery. The system includes comprehensive **observability** with **OpenTelemetry**, **Jaeger tracing**, and a **real-time monitoring dashboard**.

## 🏗️ System Architecture

```mermaid
graph TB
    Client[Client Application] --> OrderAPI[Order API<br/>Port: 5001<br/>Saga Orchestrator]
    Client --> MonitoringUI[Monitoring Dashboard<br/>Port: 3000<br/>Real-time Monitoring]
    
    OrderAPI --> RabbitMQ[RabbitMQ Message Bus<br/>Port: 5672]
    PaymentAPI[Payment API<br/>Port: 5002] --> RabbitMQ
    InventoryAPI[Inventory API<br/>Port: 5003] --> RabbitMQ
    NotificationAPI[Notification API<br/>Port: 5004] --> RabbitMQ
    
    OrderAPI --> PostgreSQL[(PostgreSQL<br/>Saga State + Outbox)]
    PaymentAPI --> PaymentDB[(PostgreSQL<br/>Payment Data + Outbox)]
    InventoryAPI --> InventoryDB[(PostgreSQL<br/>Inventory Data + Outbox)]
    NotificationAPI --> NotificationDB[(PostgreSQL<br/>Notification Data + Outbox)]
    
    %% OpenTelemetry Integration
    OrderAPI --> OTelCollector[OpenTelemetry Collector<br/>Port: 4317/4318]
    PaymentAPI --> OTelCollector
    InventoryAPI --> OTelCollector
    NotificationAPI --> OTelCollector
    
    OTelCollector --> Jaeger[Jaeger<br/>Port: 16686<br/>Distributed Tracing]
    
    subgraph "Microservices with Outbox Pattern"
        OrderAPI
        PaymentAPI
        InventoryAPI
        NotificationAPI
    end
    
    subgraph "Infrastructure & Data"
        RabbitMQ
        PostgreSQL
        PaymentDB
        InventoryDB
        NotificationDB
    end
    
    subgraph "Observability & Monitoring"
        OTelCollector
        Jaeger
        MonitoringUI
    end
    
    style OrderAPI fill:#e1f5fe
    style PaymentAPI fill:#f3e5f5
    style InventoryAPI fill:#e8f5e8
    style NotificationAPI fill:#fff8e1
    style RabbitMQ fill:#fff3e0
    style PostgreSQL fill:#fce4ec
    style OTelCollector fill:#e8f5e8
    style Jaeger fill:#fff8e1
    style MonitoringUI fill:#f3e5f5
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

### Backend Services
- **.NET 10**: Modern C# development
- **MassTransit**: Message bus, saga orchestration, and outbox/inbox patterns
- **RabbitMQ**: Message broker
- **PostgreSQL**: Saga state persistence and outbox/inbox storage
- **Entity Framework Core**: ORM for database operations

### Observability & Monitoring
- **OpenTelemetry**: Distributed tracing and metrics collection
- **Jaeger**: Distributed tracing visualization and analysis
- **OpenTelemetry Collector**: Telemetry data collection and processing
- **OTLP (OpenTelemetry Protocol)**: Standardized telemetry data transmission

### Monitoring Dashboard
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Modern UI components
- **Recharts**: Data visualization

### Infrastructure
- **Docker**: Containerization and orchestration
- **Docker Compose**: Multi-container application management

## 🚀 Getting Started

### Prerequisites
- **.NET 10 SDK**: For building and running the microservices
- **Docker & Docker Compose**: For infrastructure services (recommended)
- **Node.js 18+**: For the monitoring dashboard
- **PostgreSQL server**: Database for saga state and outbox/inbox
- **RabbitMQ server**: Message broker for service communication

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd saga-state-machine
   ```

2. **Start infrastructure services with observability stack**
   ```bash
   # Using Docker Compose (recommended)
   docker-compose up -d postgres rabbitmq otel-collector jaeger
   
   # This starts:
   # - PostgreSQL on localhost:5432
   # - RabbitMQ on localhost:5672 (Management UI: localhost:15672)
   # - OpenTelemetry Collector on localhost:4317/4318
   # - Jaeger UI on localhost:16686
   ```

3. **Configuration is ready**
   The services are pre-configured with the following settings in `appsettings.json`:
   ```json
   {
     "ConnectionStrings": {
       "Postgres": "Host=localhost;Database=SagaStateMachine[ServiceName]Db;Username=postgres;Password=postgres",
       "RabbitMQ": "amqp://guest:guest@localhost:5672/saga-state-machine"
     },
     "OpenTelemetry": {
       "ServiceName": "SagaStateMachine.[ServiceName].API",
       "ServiceVersion": "1.0.0",
       "Tracing": {
         "OtlpExporter": {
           "Endpoint": "http://localhost:4317"
         }
       },
       "Metrics": {
         "OtlpExporter": {
           "Endpoint": "http://localhost:4317"
         }
       }
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

6. **Start the monitoring dashboard**
   ```bash
   # Terminal 5: Monitoring Dashboard
   cd monitoring
   npm install
   npm run dev
   
   # Dashboard available at: http://localhost:3000
   ```

### Alternative: Docker Compose (All Services)
   ```bash
   # Start everything with Docker Compose
   docker-compose up --build
   
   # Services will be available at:
   # - Order API: http://localhost:5001
   # - Inventory API: http://localhost:5002  
   # - Payment API: http://localhost:5003
   # - Notification API: http://localhost:5004
   # - Monitoring Dashboard: http://localhost:3000
   # - Jaeger UI: http://localhost:16686
   # - RabbitMQ Management: http://localhost:15672
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

2. **Monitor the system**
   
   **Real-time Dashboard** (http://localhost:3000):
   - View live metrics and KPIs
   - Track saga state transitions
   - Monitor message flow and outbox status
   - Check service health and alerts
   
   **Jaeger Tracing** (http://localhost:16686):
   - Search for traces by service or operation
   - View end-to-end saga execution flow
   - Analyze performance bottlenecks
   - Investigate failed operations
   
   **Service Logs**:
   - Watch console output of all services
   - Observe structured logging with correlation IDs
   - Notice outbox pattern ensuring reliable delivery

3. **Explore observability features**
   
   **Distributed Tracing**:
   - Each order creates a distributed trace
   - Trace spans show message flow between services
   - Performance metrics for each operation
   - Error propagation and failure analysis
   
   **Database Monitoring**:
   - Verify saga state persistence in Order API database
   - Check outbox/inbox tables for message tracking
   - Monitor database performance metrics
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

### Observability & Monitoring
- **Distributed Tracing**: End-to-end request tracing with OpenTelemetry and Jaeger
- **Metrics Collection**: Performance metrics and KPIs via OpenTelemetry
- **Structured Logging**: Comprehensive logging throughout the flow
- **State Tracking**: Database persistence of saga states
- **Message Tracing**: Correlation IDs for end-to-end tracing
- **Outbox Monitoring**: Track message publishing status
- **Inbox Monitoring**: Track message processing status
- **Real-time Dashboard**: Live monitoring with Next.js dashboard

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
├── monitoring/                          # Real-time monitoring dashboard
│   ├── src/app/                        # Next.js pages and components
│   ├── src/components/                 # UI components and charts
│   ├── src/types/                      # TypeScript type definitions
│   └── package.json                    # Dashboard dependencies
├── opentelemetry/                      # OpenTelemetry configuration
│   └── otel-collector-config.yaml     # Collector configuration
├── docker-compose.yml                  # Complete infrastructure setup
└── SagaStateMachine.sln                # Solution file
```

## 🔍 Observability & Distributed Tracing

### OpenTelemetry Integration

The system implements comprehensive observability using **OpenTelemetry** for distributed tracing and metrics collection:

#### Tracing Configuration
```csharp
// OpenTelemetry setup in each service
services.AddOpenTelemetry()
    .ConfigureResource(r => r.AddService(serviceName, serviceVersion: serviceVersion))
    .WithTracing(b => b
        .AddSource(DiagnosticHeaders.DefaultListenerName) // MassTransit ActivitySource
        .AddAspNetCoreInstrumentation()
        .AddHttpClientInstrumentation()
        .AddOtlpExporter(options =>
        {
            options.Endpoint = new Uri("http://otel-collector:4317");
            options.Protocol = OtlpExportProtocol.Grpc;
        })
    )
    .WithMetrics(b => b
        .AddMeter(InstrumentationOptions.MeterName) // MassTransit Meter
        .AddAspNetCoreInstrumentation()
        .AddHttpClientInstrumentation()
        .AddOtlpExporter()
    );
```

#### Automatic Instrumentation
- **ASP.NET Core**: HTTP request/response tracing
- **MassTransit**: Message publishing and consumption tracing
- **HTTP Client**: Outbound HTTP call tracing
- **Entity Framework**: Database operation tracing (optional)

### Jaeger Distributed Tracing

**Jaeger** provides visualization and analysis of distributed traces:

#### Key Features
- **End-to-End Tracing**: Complete saga execution flow visualization
- **Service Dependencies**: Automatic service dependency mapping
- **Performance Analysis**: Latency breakdown and bottleneck identification
- **Error Tracking**: Failed operations and error propagation
- **Correlation**: Link related operations across services

#### Trace Correlation
Each saga execution creates a distributed trace showing:
1. **Order Submission** → Order API
2. **Payment Processing** → Payment API
3. **Inventory Reservation** → Inventory API
4. **Order Confirmation** → Notification API
5. **Message Flow** → RabbitMQ operations

### OpenTelemetry Collector

The **OpenTelemetry Collector** acts as a centralized telemetry processing hub:

```yaml
# otel-collector-config.yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

exporters:
  otlp/jaeger:
    endpoint: http://jaeger:4317
    tls:
      insecure: true

processors:
  batch:

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp/jaeger, debug]
    metrics:
      receivers: [otlp]
      processors: [batch]
      exporters: [debug]
```

#### Benefits
- **Vendor Agnostic**: Standardized telemetry data collection
- **Scalable**: Handles high-volume telemetry data
- **Flexible**: Easy to add new exporters (Prometheus, Grafana, etc.)
- **Reliable**: Built-in retry and batching mechanisms

### Metrics & KPIs

The system collects comprehensive metrics:

#### Business Metrics
- **Saga Success Rate**: Percentage of successfully completed orders
- **Processing Time**: End-to-end saga execution duration
- **Failure Reasons**: Categorized failure analysis
- **Throughput**: Orders processed per minute/hour

#### Technical Metrics
- **Message Latency**: Time from publish to consumption
- **Outbox Processing**: Message publishing delays
- **Database Performance**: Query execution times
- **Service Health**: Response times and error rates

#### MassTransit Metrics
- **Message Count**: Published/consumed message counts
- **Consumer Performance**: Message processing times
- **Retry Attempts**: Failed message retry statistics
- **Queue Depth**: Message backlog monitoring

## 📊 Real-time Monitoring Dashboard

### Next.js Monitoring Application

A comprehensive **real-time monitoring dashboard** built with **Next.js 15**:

#### Dashboard Features
- **📈 Live Metrics**: Real-time KPIs and performance indicators
- **🔄 Saga Monitoring**: Track saga states and transitions
- **📨 Message Flow**: Monitor message delivery and processing
- **📤 Outbox Status**: Track outbox pattern performance
- **🏥 Health Checks**: Service and infrastructure health
- **🚨 Alert Management**: Real-time alerts and notifications
- **📊 Analytics**: Historical trends and insights

#### Key Pages
1. **Dashboard** (`/`) - Overview with key metrics and alerts
2. **Sagas** (`/sagas`) - Saga state monitoring and exploration
3. **Messages** (`/messages`) - Message flow and status tracking
4. **Outbox** (`/outbox`) - Outbox pattern monitoring
5. **Analytics** (`/analytics`) - Advanced analytics and insights
6. **Health** (`/health`) - System health monitoring

#### Technology Stack
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Modern UI components
- **Recharts**: Data visualization
- **Real-time Updates**: Live data refresh every 5 seconds

### Monitoring Capabilities

#### Saga State Tracking
- **Visual State Flow**: Interactive saga state diagrams
- **State Duration**: Time spent in each state
- **Transition History**: Complete state change timeline
- **Failure Analysis**: Identify stuck or failed sagas
- **Correlation Tracking**: Link sagas to related messages

#### Message Monitoring
- **Delivery Status**: Track message publishing success
- **Processing Times**: End-to-end message latency
- **Retry Patterns**: Monitor retry attempts and failures
- **Throughput Metrics**: Messages per second/minute
- **Error Analysis**: Categorized failure reasons

#### Outbox Pattern Monitoring
- **Queue Depth**: Monitor outbox message backlog
- **Publishing Rate**: Track outbox processing speed
- **Atomicity Verification**: Ensure transactional consistency
- **Failure Detection**: Identify publishing failures
- **Performance Trends**: Historical outbox performance

#### Alert System
- **Real-time Alerts**: Immediate notification of issues
- **Severity Levels**: Critical, High, Medium, Low
- **Alert Categories**:
  - High error rates
  - Saga timeouts
  - Message backlogs
  - Service failures
- **Acknowledgment**: Mark alerts as resolved

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

*This project demonstrates advanced distributed system patterns including Saga Pattern, Outbox/Inbox Pattern, and comprehensive observability using modern .NET technologies. It serves as a reference implementation for building resilient, scalable microservices architectures with guaranteed message delivery, data consistency, and full distributed tracing capabilities.*

## 🌟 Key Highlights

### 🔄 **Distributed Transaction Management**
- **Saga Pattern**: Orchestrated business transactions across microservices
- **Outbox/Inbox Pattern**: Guaranteed message delivery and idempotency
- **Compensating Actions**: Automatic rollback for failed transactions

### 📊 **Comprehensive Observability**
- **OpenTelemetry Integration**: Standardized telemetry collection
- **Jaeger Distributed Tracing**: End-to-end request flow visualization
- **Real-time Monitoring**: Live dashboard with metrics and alerts
- **Performance Analytics**: Historical trends and insights

### 🏗️ **Production-Ready Architecture**
- **Microservices**: Loosely coupled, independently deployable services
- **Event-Driven**: Asynchronous communication with reliable messaging
- **Containerized**: Docker support for easy deployment
- **Scalable**: Horizontal scaling capabilities with load balancing

### 🔍 **Developer Experience**
- **Type Safety**: Full TypeScript support in monitoring dashboard
- **Modern UI**: Beautiful, responsive monitoring interface
- **Comprehensive Logging**: Structured logs with correlation tracking
- **Easy Setup**: One-command Docker Compose deployment