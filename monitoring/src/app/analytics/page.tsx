"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Activity,
  Clock,
  RefreshCw
} from "lucide-react";
import { generateTimeSeriesData } from "@/lib/mock-data";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell
} from "recharts";
import { useState } from "react";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("24h");
  const timeSeriesData = generateTimeSeriesData(timeRange === "24h" ? 24 : timeRange === "7d" ? 168 : 720);

  // Generate analytics data
  const sagaStateDistribution = [
    { name: "Completed", value: 1198, color: "#10b981" },
    { name: "Active", value: 23, color: "#f59e0b" },
    { name: "Failed", value: 26, color: "#ef4444" }
  ];

  const messageTypeDistribution = [
    { name: "OrderSubmitted", count: 450, percentage: 36.1 },
    { name: "PaymentProcessed", count: 420, percentage: 33.7 },
    { name: "InventoryReserved", count: 380, percentage: 30.5 },
    { name: "OrderConfirmed", count: 380, percentage: 30.5 },
    { name: "OrderFailed", count: 26, percentage: 2.1 }
  ];

  const performanceMetrics = [
    { metric: "Avg Saga Duration", value: "2.3s", change: -12, trend: "down" },
    { metric: "Message Throughput", value: "15.7/s", change: 8, trend: "up" },
    { metric: "Error Rate", value: "2.1%", change: -5, trend: "down" },
    { metric: "P95 Response Time", value: "234ms", change: 15, trend: "up" }
  ];

  const servicePerformance = [
    { service: "Order API", avgDuration: 1200, throughput: 45, errorRate: 0.02 },
    { service: "Payment API", avgDuration: 800, throughput: 38, errorRate: 0.05 },
    { service: "Inventory API", avgDuration: 1500, throughput: 42, errorRate: 0.12 },
    { service: "Notification API", avgDuration: 300, throughput: 35, errorRate: 0.01 }
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
            <p className="text-muted-foreground">
              Deep insights into saga performance and system behavior
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid gap-4 md:grid-cols-4">
          {performanceMetrics.map((metric) => (
            <Card key={metric.metric}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.metric}</CardTitle>
                {metric.trend === "up" ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className={`text-xs ${metric.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.change > 0 ? '+' : ''}{metric.change}% from last period
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Analytics Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="errors">Error Analysis</TabsTrigger>
            <TabsTrigger value="capacity">Capacity Planning</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Saga State Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Saga State Distribution</CardTitle>
                  <CardDescription>Current distribution of saga states</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Tooltip />
                      <RechartsPieChart data={sagaStateDistribution}>
                        {sagaStateDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </RechartsPieChart>
                    </RechartsPieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center space-x-4 mt-4">
                    {sagaStateDistribution.map((entry) => (
                      <div key={entry.name} className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-sm">{entry.name}: {entry.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Message Type Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Message Type Distribution</CardTitle>
                  <CardDescription>Breakdown of message types processed</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {messageTypeDistribution.map((type) => (
                      <div key={type.name} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{type.name}</span>
                          <span className="text-muted-foreground">{type.count} ({type.percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${type.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Throughput Over Time */}
            <Card>
              <CardHeader>
                <CardTitle>System Throughput</CardTitle>
                <CardDescription>Messages processed and saga completions over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
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
                      stackId="1"
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      name="Messages/sec"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="activeSagas" 
                      stackId="2"
                      stroke="#82ca9d" 
                      fill="#82ca9d" 
                      name="Active Sagas"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Response Time Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Response Time Trends</CardTitle>
                  <CardDescription>Average response times across services</CardDescription>
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
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="responseTime" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                        name="Response Time (ms)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Service Performance Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle>Service Performance</CardTitle>
                  <CardDescription>Comparative performance metrics by service</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={servicePerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="service" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="avgDuration" fill="#8884d8" name="Avg Duration (ms)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Service Performance Table */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Service Metrics</CardTitle>
                <CardDescription>Comprehensive performance breakdown by service</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {servicePerformance.map((service) => (
                    <div key={service.service} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Activity className="h-5 w-5 text-blue-500" />
                        <div>
                          <div className="font-medium">{service.service}</div>
                          <div className="text-sm text-muted-foreground">
                            {service.throughput} msg/s throughput
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <div className="text-sm font-medium">{service.avgDuration}ms</div>
                          <div className="text-xs text-muted-foreground">Avg Duration</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium">{(service.errorRate * 100).toFixed(1)}%</div>
                          <div className="text-xs text-muted-foreground">Error Rate</div>
                        </div>
                        <Badge 
                          variant={service.errorRate < 0.05 ? "default" : service.errorRate < 0.1 ? "secondary" : "destructive"}
                        >
                          {service.errorRate < 0.05 ? "Healthy" : service.errorRate < 0.1 ? "Warning" : "Critical"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="errors" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Error Rate Trends</CardTitle>
                  <CardDescription>Error rates over time across all services</CardDescription>
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
                      <Tooltip />
                      <Area 
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

              <Card>
                <CardHeader>
                  <CardTitle>Top Error Sources</CardTitle>
                  <CardDescription>Services with highest error rates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {servicePerformance
                      .sort((a, b) => b.errorRate - a.errorRate)
                      .map((service, index) => (
                        <div key={service.service} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-red-600">{index + 1}</span>
                            </div>
                            <span className="font-medium">{service.service}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">
                              {(service.errorRate * 100).toFixed(1)}%
                            </span>
                            <Badge 
                              variant={service.errorRate < 0.05 ? "default" : "destructive"}
                            >
                              {service.errorRate < 0.05 ? "Normal" : "High"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="capacity" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Capacity Utilization</CardTitle>
                  <CardDescription>Current system capacity usage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>CPU Usage</span>
                        <span>65%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: "65%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Memory Usage</span>
                        <span>78%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-600 h-2 rounded-full" style={{ width: "78%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Database Connections</span>
                        <span>45%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: "45%" }} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Growth Projections</CardTitle>
                  <CardDescription>Projected capacity needs based on current trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Next 30 days</span>
                      <Badge variant="secondary">+15% load</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Next 90 days</span>
                      <Badge variant="secondary">+45% load</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Scaling recommendation</span>
                      <Badge variant="outline">Add 2 instances</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
