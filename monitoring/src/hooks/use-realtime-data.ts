"use client";

import { useState, useEffect } from "react";
import { mockSagas, mockMessages, mockSystemMetrics, mockServiceHealth, mockAlerts } from "@/lib/mock-data";
import { SagaState, MessageState, SystemMetrics, ServiceHealth, Alert } from "@/types/monitoring";

export function useRealtimeData() {
  const [sagas, setSagas] = useState<SagaState[]>(mockSagas);
  const [messages, setMessages] = useState<MessageState[]>(mockMessages);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>(mockSystemMetrics);
  const [serviceHealth, setServiceHealth] = useState<ServiceHealth[]>(mockServiceHealth);
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Simulate real-time connection
    setIsConnected(true);

    // Update data every 5 seconds
    const interval = setInterval(() => {
      // Simulate data updates
      setSystemMetrics(prev => ({
        ...prev,
        activeSagas: prev.activeSagas + Math.floor(Math.random() * 3) - 1,
        messagesPerSecond: Math.max(0, prev.messagesPerSecond + (Math.random() - 0.5) * 2),
        errorRate: Math.max(0, Math.min(1, prev.errorRate + (Math.random() - 0.5) * 0.01)),
        outboxBacklog: Math.max(0, prev.outboxBacklog + Math.floor(Math.random() * 3) - 1)
      }));

      // Update service health
      setServiceHealth(prev => prev.map(service => ({
        ...service,
        responseTime: Math.max(10, service.responseTime + Math.floor(Math.random() * 20) - 10),
        errorRate: Math.max(0, Math.min(1, service.errorRate + (Math.random() - 0.5) * 0.02)),
        lastCheck: new Date()
      })));

      // Occasionally add new alerts
      if (Math.random() < 0.1) {
        const newAlert: Alert = {
          id: `alert-${Date.now()}`,
          ruleId: "rule-realtime",
          message: "Real-time alert: System performance degradation detected",
          severity: Math.random() > 0.5 ? "Medium" : "High",
          timestamp: new Date(),
          acknowledged: false,
          service: ["Order API", "Payment API", "Inventory API", "Notification API"][Math.floor(Math.random() * 4)]
        };
        setAlerts(prev => [newAlert, ...prev.slice(0, 9)]);
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      setIsConnected(false);
    };
  }, []);

  return {
    sagas,
    messages,
    systemMetrics,
    serviceHealth,
    alerts,
    isConnected
  };
}
