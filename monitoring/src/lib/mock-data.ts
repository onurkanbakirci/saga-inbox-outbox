import { SagaState, MessageState, MessageStatus, ServiceHealth, SystemMetrics, Alert } from "@/types/monitoring";

// Mock data for development
export const mockSagas: SagaState[] = [
  {
    correlationId: "550e8400-e29b-41d4-a716-446655440001",
    stateMachine: "OrderStateMachine",
    currentState: "ProcessingPayment",
    lastUpdated: new Date(Date.now() - 30000),
    duration: 45000,
    properties: {
      orderTotal: 99.99,
      customerEmail: "john@example.com",
      productId: "PROD-001"
    },
    history: [
      {
        fromState: "Initial",
        toState: "ProcessingPayment",
        event: "OrderSubmitted",
        timestamp: new Date(Date.now() - 45000),
        duration: 0
      }
    ]
  },
  {
    correlationId: "550e8400-e29b-41d4-a716-446655440002",
    stateMachine: "OrderStateMachine",
    currentState: "Completed",
    lastUpdated: new Date(Date.now() - 120000),
    duration: 180000,
    properties: {
      orderTotal: 149.99,
      customerEmail: "jane@example.com",
      productId: "PROD-002",
      paymentIntentId: "pi_1234567890"
    },
    history: [
      {
        fromState: "Initial",
        toState: "ProcessingPayment",
        event: "OrderSubmitted",
        timestamp: new Date(Date.now() - 300000),
        duration: 0
      },
      {
        fromState: "ProcessingPayment",
        toState: "ReservingInventory",
        event: "PaymentProcessed",
        timestamp: new Date(Date.now() - 240000),
        duration: 60000
      },
      {
        fromState: "ReservingInventory",
        toState: "Completed",
        event: "InventoryReserved",
        timestamp: new Date(Date.now() - 120000),
        duration: 120000
      }
    ]
  },
  {
    correlationId: "550e8400-e29b-41d4-a716-446655440003",
    stateMachine: "OrderStateMachine",
    currentState: "Failed",
    lastUpdated: new Date(Date.now() - 300000),
    duration: 90000,
    properties: {
      orderTotal: 79.99,
      customerEmail: "bob@example.com",
      productId: "PROD-003",
      failureReason: "Insufficient inventory"
    },
    history: [
      {
        fromState: "Initial",
        toState: "ProcessingPayment",
        event: "OrderSubmitted",
        timestamp: new Date(Date.now() - 390000),
        duration: 0
      },
      {
        fromState: "ProcessingPayment",
        toState: "ReservingInventory",
        event: "PaymentProcessed",
        timestamp: new Date(Date.now() - 330000),
        duration: 60000
      },
      {
        fromState: "ReservingInventory",
        toState: "Failed",
        event: "OrderFailed",
        timestamp: new Date(Date.now() - 300000),
        duration: 30000
      }
    ]
  }
];

export const mockMessages: MessageState[] = [
  {
    messageId: "msg-001",
    messageType: "OrderSubmitted",
    status: MessageStatus.Published,
    enqueueTime: new Date(Date.now() - 60000),
    sentTime: new Date(Date.now() - 58000),
    retryCount: 0,
    correlationId: "550e8400-e29b-41d4-a716-446655440001",
    service: "Order API"
  },
  {
    messageId: "msg-002",
    messageType: "ProcessPayment",
    status: MessageStatus.Published,
    enqueueTime: new Date(Date.now() - 45000),
    sentTime: new Date(Date.now() - 43000),
    retryCount: 0,
    correlationId: "550e8400-e29b-41d4-a716-446655440001",
    service: "Order API"
  },
  {
    messageId: "msg-003",
    messageType: "PaymentProcessed",
    status: MessageStatus.Pending,
    enqueueTime: new Date(Date.now() - 30000),
    retryCount: 0,
    correlationId: "550e8400-e29b-41d4-a716-446655440001",
    service: "Payment API"
  },
  {
    messageId: "msg-004",
    messageType: "OrderFailed",
    status: MessageStatus.Failed,
    enqueueTime: new Date(Date.now() - 300000),
    retryCount: 3,
    errorMessage: "Connection timeout to inventory service",
    correlationId: "550e8400-e29b-41d4-a716-446655440003",
    service: "Inventory API"
  }
];

export const mockServiceHealth: ServiceHealth[] = [
  {
    serviceName: "Order API",
    status: "Healthy",
    lastCheck: new Date(),
    responseTime: 45,
    errorRate: 0.02,
    activeConnections: 12
  },
  {
    serviceName: "Payment API",
    status: "Healthy",
    lastCheck: new Date(),
    responseTime: 78,
    errorRate: 0.05,
    activeConnections: 8
  },
  {
    serviceName: "Inventory API",
    status: "Degraded",
    lastCheck: new Date(),
    responseTime: 234,
    errorRate: 0.12,
    activeConnections: 15
  },
  {
    serviceName: "Notification API",
    status: "Healthy",
    lastCheck: new Date(),
    responseTime: 32,
    errorRate: 0.01,
    activeConnections: 5
  }
];

export const mockSystemMetrics: SystemMetrics = {
  totalSagas: 1247,
  activeSagas: 23,
  completedSagas: 1198,
  failedSagas: 26,
  messagesPerSecond: 15.7,
  averageProcessingTime: 2340,
  errorRate: 0.021,
  outboxBacklog: 5
};

export const mockAlerts: Alert[] = [
  {
    id: "alert-001",
    ruleId: "rule-001",
    message: "High error rate detected in Inventory API (12%)",
    severity: "High",
    timestamp: new Date(Date.now() - 300000),
    acknowledged: false,
    service: "Inventory API"
  },
  {
    id: "alert-002",
    ruleId: "rule-002",
    message: "Saga processing time exceeded threshold (5 minutes)",
    severity: "Medium",
    timestamp: new Date(Date.now() - 600000),
    acknowledged: true,
    service: "Order API"
  }
];

// Generate time series data for charts
export const generateTimeSeriesData = (points: number = 24) => {
  const now = new Date();
  const data = [];
  
  for (let i = points - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    data.push({
      timestamp: timestamp.toISOString(),
      messagesPerSecond: Math.floor(Math.random() * 30) + 10,
      errorRate: Math.random() * 0.1,
      activeSagas: Math.floor(Math.random() * 50) + 10,
      responseTime: Math.floor(Math.random() * 200) + 50
    });
  }
  
  return data;
};
