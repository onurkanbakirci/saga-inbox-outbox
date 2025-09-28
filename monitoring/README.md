# MassTransit Monitor

A comprehensive real-time monitoring dashboard for MassTransit saga state machines and outbox/inbox patterns.

## 🚀 Features

### 📊 **Real-time Dashboard**
- Live system metrics and KPIs
- Service health monitoring
- Alert management
- Real-time data updates every 5 seconds

### 🔄 **Saga State Monitoring**
- Track saga instances across all states
- Detailed saga history and transitions
- Search and filter capabilities
- Visual state flow representation

### 📨 **Message & Outbox Monitoring**
- Monitor message delivery status
- Track outbox/inbox pattern performance
- Retry analysis and failure detection
- Message correlation tracking

### 📈 **Advanced Analytics**
- Performance trends and metrics
- Error analysis and patterns
- Capacity planning insights
- Service comparison charts

### 🏥 **Health Monitoring**
- Service health status
- Infrastructure component monitoring
- Response time tracking
- Connection pool monitoring

## 🛠️ Technology Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Modern UI components
- **Recharts** - Data visualization
- **Lucide React** - Beautiful icons
- **date-fns** - Date manipulation

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Navigate to monitoring directory**
   ```bash
   cd monitoring
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   ```
   http://localhost:3000
   ```

## 📱 Application Structure

### Pages
- **Dashboard** (`/`) - Overview with key metrics and alerts
- **Sagas** (`/sagas`) - Saga state monitoring and exploration
- **Messages** (`/messages`) - Message flow and status tracking
- **Outbox** (`/outbox`) - Outbox pattern monitoring
- **Analytics** (`/analytics`) - Advanced analytics and insights
- **Health** (`/health`) - System health monitoring

### Components
- **Layout Components** - Sidebar navigation and main layout
- **UI Components** - Reusable shadcn/ui components
- **Charts** - Data visualization components

### Features
- **Real-time Updates** - Live data refresh with connection status
- **Responsive Design** - Works on desktop and mobile
- **Dark Mode Ready** - Built with shadcn/ui theming
- **Type Safety** - Full TypeScript coverage

## 🔧 Configuration

### Mock Data
The application currently uses mock data for demonstration. To connect to real MassTransit services:

1. **Update data sources** in `src/lib/mock-data.ts`
2. **Configure API endpoints** for your MassTransit services
3. **Implement real-time connections** (WebSocket/SignalR)

### Customization
- **Themes** - Modify `tailwind.config.js` and component styles
- **Metrics** - Add custom metrics in `src/types/monitoring.ts`
- **Charts** - Extend chart components in analytics pages

## 📊 Monitoring Capabilities

### Saga Monitoring
- **State Tracking** - Monitor saga progression through states
- **Duration Analysis** - Track processing times
- **Failure Detection** - Identify stuck or failed sagas
- **Correlation** - Link sagas to related messages

### Message Monitoring
- **Delivery Status** - Track message publishing success
- **Retry Patterns** - Monitor retry attempts and failures
- **Throughput** - Messages per second metrics
- **Latency** - End-to-end processing times

### Outbox Pattern Monitoring
- **Queue Depth** - Monitor outbox message backlog
- **Publishing Rate** - Track outbox processing speed
- **Failure Analysis** - Identify publishing failures
- **Atomicity** - Ensure transactional consistency

### System Health
- **Service Status** - Monitor all microservices
- **Infrastructure** - Database and message broker health
- **Performance** - Response times and error rates
- **Capacity** - Resource utilization tracking

## 🚨 Alerting

### Alert Types
- **High Error Rate** - Service error rate exceeds threshold
- **Saga Timeout** - Sagas stuck in state too long
- **Message Backlog** - Outbox queue growing too large
- **Service Down** - Service health check failures

### Alert Management
- **Real-time Notifications** - Immediate alert display
- **Acknowledgment** - Mark alerts as acknowledged
- **Severity Levels** - Low, Medium, High, Critical
- **Service Context** - Alerts linked to specific services

## 📈 Analytics & Insights

### Performance Analytics
- **Throughput Trends** - Historical message volume
- **Response Time Analysis** - P95/P99 latencies
- **Error Rate Trends** - Failure patterns over time
- **Capacity Utilization** - Resource usage patterns

### Business Insights
- **Saga Success Rates** - Business process completion rates
- **Processing Times** - End-to-end transaction durations
- **Failure Analysis** - Common failure points
- **Growth Projections** - Capacity planning data

## 🔮 Future Enhancements

### Planned Features
- **Real API Integration** - Connect to actual MassTransit services
- **Custom Dashboards** - User-configurable dashboard layouts
- **Advanced Filtering** - Complex query capabilities
- **Export Functionality** - Data export for reporting
- **Webhook Integration** - External alert notifications
- **Multi-tenant Support** - Support for multiple environments

### Technical Improvements
- **WebSocket Integration** - Real-time data streaming
- **Caching Layer** - Improved performance with Redis
- **Authentication** - User management and RBAC
- **API Documentation** - OpenAPI/Swagger integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is part of the MassTransit Saga State Machine example and follows the same MIT License.

---

*Built with ❤️ for the MassTransit community*