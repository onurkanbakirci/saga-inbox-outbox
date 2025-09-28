"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Activity, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Database,
  Server,
  Wifi,
  Clock
} from "lucide-react";
import { useRealtimeData } from "@/hooks/use-realtime-data";
import { formatDistanceToNow } from "date-fns";

export default function HealthPage() {
  const { serviceHealth, isConnected } = useRealtimeData();

  const overallHealth = serviceHealth.every(s => s.status === "Healthy") ? "Healthy" : 
                       serviceHealth.some(s => s.status === "Unhealthy") ? "Unhealthy" : "Degraded";

  const systemComponents = [
    {
      name: "RabbitMQ",
      status: "Healthy",
      responseTime: 12,
      uptime: "99.9%",
      connections: 45,
      icon: Server
    },
    {
      name: "PostgreSQL",
      status: "Healthy", 
      responseTime: 8,
      uptime: "99.95%",
      connections: 28,
      icon: Database
    },
    {
      name: "Network",
      status: "Healthy",
      responseTime: 5,
      uptime: "100%",
      connections: 0,
      icon: Wifi
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Healthy": return "text-green-600";
      case "Degraded": return "text-yellow-600";
      case "Unhealthy": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Healthy": return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "Degraded": return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "Unhealthy": return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">System Health</h2>
            <p className="text-muted-foreground">
              Monitor the health and status of all system components
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-muted-foreground">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <Button>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Overall Health Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getStatusIcon(overallHealth)}
              <span>Overall System Health</span>
            </CardTitle>
            <CardDescription>
              System-wide health status based on all monitored components
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  <Badge 
                    variant={
                      overallHealth === "Healthy" ? "default" : 
                      overallHealth === "Degraded" ? "secondary" : "destructive"
                    }
                    className="text-lg px-4 py-2"
                  >
                    {overallHealth}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {serviceHealth.filter(s => s.status === "Healthy").length} of {serviceHealth.length} services healthy
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Last check</div>
                <div className="font-medium">
                  {formatDistanceToNow(new Date(), { addSuffix: true })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Health */}
        <Card>
          <CardHeader>
            <CardTitle>Service Health Status</CardTitle>
            <CardDescription>
              Health status and performance metrics for all microservices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {serviceHealth.map((service) => (
                <div key={service.serviceName} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(service.status)}
                      <div>
                        <h3 className="font-semibold">{service.serviceName}</h3>
                        <p className="text-sm text-muted-foreground">
                          Last checked {formatDistanceToNow(service.lastCheck, { addSuffix: true })}
                        </p>
                      </div>
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

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm font-medium">Response Time</div>
                      <div className="text-2xl font-bold">{service.responseTime}ms</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className={`h-2 rounded-full ${
                            service.responseTime < 100 ? 'bg-green-500' : 
                            service.responseTime < 500 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(100, (service.responseTime / 1000) * 100)}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium">Error Rate</div>
                      <div className="text-2xl font-bold">{(service.errorRate * 100).toFixed(1)}%</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className={`h-2 rounded-full ${
                            service.errorRate < 0.05 ? 'bg-green-500' : 
                            service.errorRate < 0.1 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${service.errorRate * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium">Active Connections</div>
                      <div className="text-2xl font-bold">{service.activeConnections}</div>
                      <div className="text-sm text-muted-foreground">
                        {service.activeConnections < 20 ? 'Normal' : 'High'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Infrastructure Health */}
        <Card>
          <CardHeader>
            <CardTitle>Infrastructure Components</CardTitle>
            <CardDescription>
              Health status of underlying infrastructure components
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemComponents.map((component) => (
                <div key={component.name} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <component.icon className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="font-medium">{component.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {component.responseTime}ms response time
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-sm font-medium">{component.uptime}</div>
                      <div className="text-xs text-muted-foreground">Uptime</div>
                    </div>
                    
                    {component.connections > 0 && (
                      <div className="text-center">
                        <div className="text-sm font-medium">{component.connections}</div>
                        <div className="text-xs text-muted-foreground">Connections</div>
                      </div>
                    )}
                    
                    <Badge variant="default">
                      {component.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Health Check Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Health Check Configuration</CardTitle>
            <CardDescription>
              Current health monitoring settings and thresholds
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">Check Intervals</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Service Health</span>
                    <span className="text-muted-foreground">30 seconds</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Database Health</span>
                    <span className="text-muted-foreground">60 seconds</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Message Queue</span>
                    <span className="text-muted-foreground">15 seconds</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Alert Thresholds</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Response Time</span>
                    <span className="text-muted-foreground">&gt; 500ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Error Rate</span>
                    <span className="text-muted-foreground">&gt; 5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Connection Pool</span>
                    <span className="text-muted-foreground">&gt; 80%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
