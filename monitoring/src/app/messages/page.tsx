"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Search, 
  RefreshCw, 
  Eye, 
  CheckCircle, 
  Clock, 
  XCircle, 
  RotateCcw,
  MessageSquare
} from "lucide-react";
import { mockMessages } from "@/lib/mock-data";
import { MessageState, MessageStatus } from "@/types/monitoring";
import { formatDistanceToNow, format } from "date-fns";
import { useState } from "react";

export default function MessagesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState<MessageState | null>(null);

  const filteredMessages = mockMessages.filter(message => {
    const matchesSearch = message.messageId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.messageType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.correlationId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || message.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesService = serviceFilter === "all" || message.service.toLowerCase() === serviceFilter.toLowerCase();
    return matchesSearch && matchesStatus && matchesService;
  });

  const getStatusIcon = (status: MessageStatus) => {
    switch (status) {
      case MessageStatus.Published:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case MessageStatus.Failed:
        return <XCircle className="h-4 w-4 text-red-500" />;
      case MessageStatus.Pending:
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case MessageStatus.Retrying:
        return <RotateCcw className="h-4 w-4 text-blue-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: MessageStatus) => {
    switch (status) {
      case MessageStatus.Published:
        return "default";
      case MessageStatus.Failed:
        return "destructive";
      case MessageStatus.Pending:
        return "secondary";
      case MessageStatus.Retrying:
        return "outline";
      default:
        return "outline";
    }
  };

  const uniqueServices = Array.from(new Set(mockMessages.map(m => m.service)));

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Message Inspector</h2>
            <p className="text-muted-foreground">
              Monitor message flow and outbox/inbox states across services
            </p>
          </div>
          <Button>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockMessages.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockMessages.filter(m => m.status === MessageStatus.Published).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockMessages.filter(m => m.status === MessageStatus.Pending).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockMessages.filter(m => m.status === MessageStatus.Failed).length}
              </div>
            </CardContent>
          </Card>
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
                    placeholder="Search by message ID, type, or correlation ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="retrying">Retrying</SelectItem>
                </SelectContent>
              </Select>
              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  {uniqueServices.map(service => (
                    <SelectItem key={service} value={service.toLowerCase()}>
                      {service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Messages Table */}
        <Card>
          <CardHeader>
            <CardTitle>Messages ({filteredMessages.length})</CardTitle>
            <CardDescription>
              Real-time view of message states across all services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Message ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Retry Count</TableHead>
                  <TableHead>Enqueued</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMessages.map((message) => (
                  <TableRow key={message.messageId}>
                    <TableCell className="font-mono text-sm">
                      {message.messageId}
                    </TableCell>
                    <TableCell className="font-medium">
                      {message.messageType}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(message.status)}
                        <Badge variant={getStatusBadgeVariant(message.status)}>
                          {message.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{message.service}</Badge>
                    </TableCell>
                    <TableCell>
                      {message.retryCount > 0 ? (
                        <Badge variant="secondary">{message.retryCount}</Badge>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDistanceToNow(message.enqueueTime, { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-sm">
                      {message.sentTime ? 
                        formatDistanceToNow(message.sentTime, { addSuffix: true }) : 
                        <span className="text-muted-foreground">Not sent</span>
                      }
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedMessage(message)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Message Details</DialogTitle>
                            <DialogDescription>
                              Detailed information for message {selectedMessage?.messageId}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedMessage && (
                            <div className="space-y-6">
                              {/* Basic Info */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">Message ID</label>
                                  <div className="font-mono text-sm mt-1">
                                    {selectedMessage.messageId}
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Message Type</label>
                                  <div className="font-medium mt-1">
                                    {selectedMessage.messageType}
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Status</label>
                                  <div className="flex items-center space-x-2 mt-1">
                                    {getStatusIcon(selectedMessage.status)}
                                    <Badge variant={getStatusBadgeVariant(selectedMessage.status)}>
                                      {selectedMessage.status}
                                    </Badge>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Service</label>
                                  <div className="mt-1">
                                    <Badge variant="outline">{selectedMessage.service}</Badge>
                                  </div>
                                </div>
                              </div>

                              {/* Timing Info */}
                              <div className="space-y-3">
                                <h4 className="font-medium">Timing Information</h4>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">Enqueued At</label>
                                    <div className="text-sm mt-1">
                                      {format(selectedMessage.enqueueTime, "PPpp")}
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Sent At</label>
                                    <div className="text-sm mt-1">
                                      {selectedMessage.sentTime ? 
                                        format(selectedMessage.sentTime, "PPpp") : 
                                        <span className="text-muted-foreground">Not sent</span>
                                      }
                                    </div>
                                  </div>
                                </div>
                                {selectedMessage.sentTime && (
                                  <div>
                                    <label className="text-sm font-medium">Processing Time</label>
                                    <div className="text-sm mt-1">
                                      {Math.abs(selectedMessage.sentTime.getTime() - selectedMessage.enqueueTime.getTime())}ms
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Correlation Info */}
                              {selectedMessage.correlationId && (
                                <div>
                                  <label className="text-sm font-medium">Correlation ID</label>
                                  <div className="font-mono text-sm mt-1">
                                    {selectedMessage.correlationId}
                                  </div>
                                </div>
                              )}

                              {/* Retry Info */}
                              {selectedMessage.retryCount > 0 && (
                                <div className="space-y-2">
                                  <h4 className="font-medium">Retry Information</h4>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium">Retry Count</label>
                                      <div className="mt-1">
                                        <Badge variant="secondary">{selectedMessage.retryCount}</Badge>
                                      </div>
                                    </div>
                                    {selectedMessage.errorMessage && (
                                      <div>
                                        <label className="text-sm font-medium">Last Error</label>
                                        <div className="text-sm text-red-600 mt-1">
                                          {selectedMessage.errorMessage}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Actions */}
                              <div className="flex gap-2 pt-4 border-t">
                                <Button variant="outline" size="sm">
                                  <RotateCcw className="h-4 w-4 mr-1" />
                                  Retry
                                </Button>
                                <Button variant="outline" size="sm">
                                  View Saga
                                </Button>
                              </div>
                            </div>
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
