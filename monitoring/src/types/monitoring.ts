export interface SagaState {
  correlationId: string;
  stateMachine: string;
  currentState: string;
  lastUpdated: Date;
  duration: number;
  properties: Record<string, any>;
  history: StateTransition[];
}

export interface StateTransition {
  fromState: string;
  toState: string;
  event: string;
  timestamp: Date;
  duration: number;
}

export interface MessageState {
  messageId: string;
  messageType: string;
  status: MessageStatus;
  enqueueTime: Date;
  sentTime?: Date;
  retryCount: number;
  errorMessage?: string;
  correlationId?: string;
  service: string;
}

export enum MessageStatus {
  Pending = "Pending",
  Published = "Published",
  Failed = "Failed",
  Retrying = "Retrying"
}

export interface ServiceHealth {
  serviceName: string;
  status: "Healthy" | "Degraded" | "Unhealthy";
  lastCheck: Date;
  responseTime: number;
  errorRate: number;
  activeConnections: number;
}

export interface SystemMetrics {
  totalSagas: number;
  activeSagas: number;
  completedSagas: number;
  failedSagas: number;
  messagesPerSecond: number;
  averageProcessingTime: number;
  errorRate: number;
  outboxBacklog: number;
}

export interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  severity: "Low" | "Medium" | "High" | "Critical";
  enabled: boolean;
}

export interface Alert {
  id: string;
  ruleId: string;
  message: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  timestamp: Date;
  acknowledged: boolean;
  service: string;
}
