"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database, 
  MessageSquare, 
  TrendingUp, 
  Workflow,
  XCircle
} from "lucide-react";
import { generateTimeSeriesData } from "@/lib/mock-data";
import { useRealtimeData } from "@/hooks/use-realtime-data";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const { systemMetrics, serviceHealth, alerts, isConnected } = useRealtimeData();
  const timeSeriesData = generateTimeSeriesData();
  const healthyServices = serviceHealth.filter(s => s.status === "Healthy").length;
  const totalServices = serviceHealth.length;
  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged).length;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time monitoring of your MassTransit saga and message flows
          </p>
        </div>

        {/* Alerts */}
        {unacknowledgedAlerts > 0 && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              You have {unacknowledgedAlerts} unacknowledged alert{unacknowledgedAlerts > 1 ? 's' : ''} requiring attention.
            </AlertDescription>
          </Alert>
        )}

        {/* Key Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sagas</CardTitle>
              <Workflow className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemMetrics.activeSagas}</div>
              <p className="text-xs text-muted-foreground">
                {systemMetrics.totalSagas} total sagas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages/sec</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemMetrics.messagesPerSecond}</div>
              <p className="text-xs text-muted-foreground">
                Avg processing: {systemMetrics.averageProcessingTime}ms
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(systemMetrics.errorRate * 100).toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {systemMetrics.failedSagas} failed sagas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outbox Backlog</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemMetrics.outboxBacklog}</div>
              <p className="text-xs text-muted-foreground">
                Pending messages
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Message Throughput</CardTitle>
              <CardDescription>Messages processed per second over time</CardDescription>
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
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Response Time</CardTitle>
              <CardDescription>Average response time across services</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="responseTime" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Service Health and Recent Alerts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Service Health</CardTitle>
              <CardDescription>
                {healthyServices}/{totalServices} services healthy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {serviceHealth.map((service) => (
                <div key={service.serviceName} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {service.status === "Healthy" && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    {service.status === "Degraded" && (
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    )}
                    {service.status === "Unhealthy" && (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="font-medium">{service.serviceName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={
                        service.status === "Healthy" ? "default" : 
                        service.status === "Degraded" ? "secondary" : "destructive"
                      }
                    >
                      {service.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {service.responseTime}ms
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Alerts</CardTitle>
              <CardDescription>Latest system alerts and notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {alert.severity === "Critical" && (
                      <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                    )}
                    {alert.severity === "High" && (
                      <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                    )}
                    {alert.severity === "Medium" && (
                      <Clock className="h-4 w-4 text-yellow-500 mt-0.5" />
                    )}
                    {alert.severity === "Low" && (
                      <Activity className="h-4 w-4 text-blue-500 mt-0.5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {alert.service}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
                      </span>
                      {!alert.acknowledged && (
                        <Badge variant="destructive" className="text-xs">
                          Unacknowledged
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Saga State Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Saga State Distribution</CardTitle>
            <CardDescription>Current distribution of saga states</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Completed</span>
                <span className="text-sm text-muted-foreground">
                  {systemMetrics.completedSagas} ({((systemMetrics.completedSagas / systemMetrics.totalSagas) * 100).toFixed(1)}%)
                </span>
              </div>
              <Progress 
                value={(systemMetrics.completedSagas / systemMetrics.totalSagas) * 100} 
                className="h-2"
              />
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Active</span>
                <span className="text-sm text-muted-foreground">
                  {systemMetrics.activeSagas} ({((systemMetrics.activeSagas / systemMetrics.totalSagas) * 100).toFixed(1)}%)
                </span>
              </div>
              <Progress 
                value={(systemMetrics.activeSagas / systemMetrics.totalSagas) * 100} 
                className="h-2"
              />
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Failed</span>
                <span className="text-sm text-muted-foreground">
                  {systemMetrics.failedSagas} ({((systemMetrics.failedSagas / systemMetrics.totalSagas) * 100).toFixed(1)}%)
                </span>
              </div>
              <Progress 
                value={(systemMetrics.failedSagas / systemMetrics.totalSagas) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}