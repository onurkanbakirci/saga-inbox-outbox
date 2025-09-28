"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Database, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Activity
} from "lucide-react";
import { mockMessages, mockServiceHealth, generateTimeSeriesData } from "@/lib/mock-data";
import { MessageStatus } from "@/types/monitoring";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

export default function OutboxPage() {
  const timeSeriesData = generateTimeSeriesData();
  
  // Calculate outbox metrics
  const pendingMessages = mockMessages.filter(m => m.status === MessageStatus.Pending).length;
  const failedMessages = mockMessages.filter(m => m.status === MessageStatus.Failed).length;
  const publishedMessages = mockMessages.filter(m => m.status === MessageStatus.Published).length;
  const totalMessages = mockMessages.length;
  
  const successRate = totalMessages > 0 ? (publishedMessages / totalMessages) * 100 : 0;
  const failureRate = totalMessages > 0 ? (failedMessages / totalMessages) * 100 : 0;

  // Service-specific outbox data
  const serviceOutboxData = mockServiceHealth.map(service => ({
    service: service.serviceName,
    pending: Math.floor(Math.random() * 10),
    failed: Math.floor(Math.random() * 5),
    published: Math.floor(Math.random() * 50) + 20,
    avgProcessingTime: service.responseTime,
    status: service.status
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Healthy": return "text-green-600";
      case "Degraded": return "text-yellow-600";
      case "Unhealthy": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Outbox Monitor</h2>
            <p className="text-muted-foreground">
              Monitor outbox pattern implementation and message delivery reliability
            </p>
          </div>
          <Button>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Alerts */}
        {failedMessages > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {failedMessages} message{failedMessages > 1 ? 's' : ''} failed to publish. Check service health and retry mechanisms.
            </AlertDescription>
          </Alert>
        )}

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Messages</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingMessages}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting publication
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{successRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {publishedMessages} published successfully
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Messages</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{failedMessages}</div>
              <p className="text-xs text-muted-foreground">
                {failureRate.toFixed(1)}% failure rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Throughput</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMessages}</div>
              <p className="text-xs text-muted-foreground">
                Messages processed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Outbox Throughput</CardTitle>
              <CardDescription>Messages published over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="messagesPerSecond" 
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Service Outbox Status</CardTitle>
              <CardDescription>Outbox performance by service</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={serviceOutboxData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="service" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="published" fill="#10b981" name="Published" />
                  <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
                  <Bar dataKey="failed" fill="#ef4444" name="Failed" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Service Details */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Service Outbox Health</CardTitle>
              <CardDescription>Outbox status and performance by service</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {serviceOutboxData.map((service) => (
                <div key={service.service} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Activity className={`h-4 w-4 ${getStatusColor(service.status)}`} />
                      <span className="font-medium">{service.service}</span>
                    </div>
                    <Badge 
                      variant={
                        service.status === "Healthy" ? "default" : 
                        service.status === "Degraded" ? "secondary" : "destructive"
                      }
                    >
                      {service.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Published:</span>
                      <div className="font-medium text-green-600">{service.published}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Pending:</span>
                      <div className="font-medium text-yellow-600">{service.pending}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Failed:</span>
                      <div className="font-medium text-red-600">{service.failed}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Success Rate</span>
                      <span>{((service.published / (service.published + service.failed + service.pending)) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress 
                      value={(service.published / (service.published + service.failed + service.pending)) * 100}
                      className="h-2"
                    />
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    Avg Processing Time: {service.avgProcessingTime}ms
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Outbox Configuration</CardTitle>
              <CardDescription>Current outbox pattern settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Batch Size</span>
                  <span className="text-muted-foreground">100 messages</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Polling Interval</span>
                  <span className="text-muted-foreground">5 seconds</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Retry Attempts</span>
                  <span className="text-muted-foreground">3 times</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Retry Delay</span>
                  <span className="text-muted-foreground">Exponential backoff</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Message Retention</span>
                  <span className="text-muted-foreground">7 days</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Database Tables</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <span>OutboxMessage</span>
                    <Badge variant="outline">Active</Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <span>OutboxState</span>
                    <Badge variant="outline">Active</Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <span>InboxState</span>
                    <Badge variant="outline">Active</Badge>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full">
                  <Database className="h-4 w-4 mr-2" />
                  View Database Schema
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Message Delivery Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Message Delivery Performance</CardTitle>
            <CardDescription>Average delivery times and success rates over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleString()}
                />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="responseTime" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.3}
                  name="Response Time (ms)"
                />
                <Area 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="errorRate" 
                  stroke="#ef4444" 
                  fill="#ef4444" 
                  fillOpacity={0.3}
                  name="Error Rate"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
