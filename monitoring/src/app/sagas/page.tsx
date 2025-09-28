"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Filter, 
  Eye, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { mockSagas } from "@/lib/mock-data";
import { SagaState } from "@/types/monitoring";
import { formatDistanceToNow, format } from "date-fns";
import { useState } from "react";

export default function SagasPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [selectedSaga, setSelectedSaga] = useState<SagaState | null>(null);

  const filteredSagas = mockSagas.filter(saga => {
    const matchesSearch = saga.correlationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         saga.properties.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesState = stateFilter === "all" || saga.currentState.toLowerCase() === stateFilter.toLowerCase();
    return matchesSearch && matchesState;
  });

  const getStateIcon = (state: string) => {
    switch (state.toLowerCase()) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "processingpayment":
      case "reservinginventory":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStateBadgeVariant = (state: string) => {
    switch (state.toLowerCase()) {
      case "completed":
        return "default";
      case "failed":
        return "destructive";
      case "processingpayment":
      case "reservinginventory":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Saga Explorer</h2>
            <p className="text-muted-foreground">
              Monitor and explore saga state machines across your services
            </p>
          </div>
          <Button>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by correlation ID or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <Select value={stateFilter} onValueChange={setStateFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  <SelectItem value="processingpayment">Processing Payment</SelectItem>
                  <SelectItem value="reservinginventory">Reserving Inventory</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Saga Table */}
        <Card>
          <CardHeader>
            <CardTitle>Active Sagas ({filteredSagas.length})</CardTitle>
            <CardDescription>
              Real-time view of saga instances and their current states
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Correlation ID</TableHead>
                  <TableHead>State Machine</TableHead>
                  <TableHead>Current State</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSagas.map((saga) => (
                  <TableRow key={saga.correlationId}>
                    <TableCell className="font-mono text-sm">
                      {saga.correlationId.slice(0, 8)}...
                    </TableCell>
                    <TableCell>{saga.stateMachine}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStateIcon(saga.currentState)}
                        <Badge variant={getStateBadgeVariant(saga.currentState)}>
                          {saga.currentState}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{saga.properties.customerEmail}</TableCell>
                    <TableCell>{Math.floor(saga.duration / 1000)}s</TableCell>
                    <TableCell>
                      {formatDistanceToNow(saga.lastUpdated, { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedSaga(saga)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>Saga Details</DialogTitle>
                            <DialogDescription>
                              Detailed view of saga {selectedSaga?.correlationId}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedSaga && (
                            <Tabs defaultValue="overview" className="w-full">
                              <TabsList>
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="history">State History</TabsTrigger>
                                <TabsTrigger value="properties">Properties</TabsTrigger>
                              </TabsList>
                              
                              <TabsContent value="overview" className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <Card>
                                    <CardHeader className="pb-2">
                                      <CardTitle className="text-sm">Current State</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="flex items-center space-x-2">
                                        {getStateIcon(selectedSaga.currentState)}
                                        <Badge variant={getStateBadgeVariant(selectedSaga.currentState)}>
                                          {selectedSaga.currentState}
                                        </Badge>
                                      </div>
                                    </CardContent>
                                  </Card>
                                  
                                  <Card>
                                    <CardHeader className="pb-2">
                                      <CardTitle className="text-sm">Duration</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="text-2xl font-bold">
                                        {Math.floor(selectedSaga.duration / 1000)}s
                                      </div>
                                    </CardContent>
                                  </Card>
                                  
                                  <Card>
                                    <CardHeader className="pb-2">
                                      <CardTitle className="text-sm">Last Updated</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="text-sm">
                                        {format(selectedSaga.lastUpdated, "PPpp")}
                                      </div>
                                    </CardContent>
                                  </Card>
                                  
                                  <Card>
                                    <CardHeader className="pb-2">
                                      <CardTitle className="text-sm">State Machine</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="text-sm font-medium">
                                        {selectedSaga.stateMachine}
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>
                              </TabsContent>
                              
                              <TabsContent value="history" className="space-y-4">
                                <div className="space-y-3">
                                  {selectedSaga.history.map((transition, index) => (
                                    <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg">
                                      <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                          <span className="text-xs font-medium text-blue-600">
                                            {index + 1}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center space-x-2">
                                          <span className="font-medium">{transition.fromState}</span>
                                          <span className="text-muted-foreground">→</span>
                                          <span className="font-medium">{transition.toState}</span>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                          Event: {transition.event}
                                        </div>
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        {format(transition.timestamp, "HH:mm:ss")}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </TabsContent>
                              
                              <TabsContent value="properties" className="space-y-4">
                                <div className="space-y-2">
                                  {Object.entries(selectedSaga.properties).map(([key, value]) => (
                                    <div key={key} className="flex justify-between py-2 border-b">
                                      <span className="font-medium">{key}</span>
                                      <span className="text-muted-foreground">
                                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </TabsContent>
                            </Tabs>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
