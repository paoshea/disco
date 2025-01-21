# DISCO! Technical Architecture

## System Overview

DISCO! is built on a microservices architecture to ensure scalability, maintainability, and robust handling of location-based services.
The system is designed to handle real-time location updates while maintaining strict privacy and security standards.

## Tech Stack Components

### Mobile Applications

#### iOS App

- **Language**: Swift 5.9
- **Architecture Pattern**: MVVM-C (Model-View-ViewModel with Coordinator)
- **Key Frameworks**:
  - CoreLocation for precise location handling
  - Push Notifications via APNs
  - CoreBluetooth for enhanced proximity detection
  - MapKit for visualization
  - Combine for reactive programming
  - SwiftUI for modern UI components

#### Android App

- **Language**: Kotlin
- **Architecture Pattern**: MVVM with Clean Architecture
- **Key Frameworks**:
  - Google Play Services Location API
  - Firebase Cloud Messaging (FCM)
  - Jetpack Compose for UI
  - Kotlin Coroutines for async operations
  - Android Bluetooth LE API
  - Google Maps SDK

### Backend Services

#### Core API Service

- **Language**: Go
- **Framework**: Gin
- **Features**:
  - High-performance request handling
  - Excellent concurrency support
  - Low latency for real-time operations

#### Location Processing Service

- **Language**: Rust
- **Features**:
  - Efficient spatial calculations
  - Real-time location matching
  - Geohashing for quick proximity searches

#### User Management Service

- **Language**: Node.js
- **Framework**: NestJS
- **Features**:
  - User authentication
  - Profile management
  - Preferences handling

#### Real-time Matching Service

- **Language**: Elixir
- **Framework**: Phoenix
- **Features**:
  - WebSocket connections
  - Real-time user matching
  - Pub/Sub system for notifications

### Databases

#### Primary Data Store

- **Technology**: PostgreSQL 15
- **Extensions**:
  - PostGIS for geospatial queries
  - TimescaleDB for time-series data
  - pg_crypto for encryption

#### Cache Layer

- **Technology**: Redis
- **Usage**:
  - Session management
  - Real-time location caching
  - Rate limiting
  - Temporary data storage

#### Search Engine

- **Technology**: Elasticsearch
- **Usage**:
  - User discovery
  - Interest matching
  - Full-text search capabilities

### Infrastructure & DevOps

#### Cloud Provider

- **Primary**: AWS
- **Key Services**:
  - EKS for container orchestration
  - Aurora PostgreSQL for database
  - ElastiCache for Redis
  - CloudFront for CDN
  - Route 53 for DNS
  - AWS Shield for DDoS protection

#### Monitoring & Analytics

- **Tools**:
  - Prometheus for metrics
  - Grafana for visualization
  - ELK Stack for log management
  - New Relic for APM
  - Sentry for error tracking

#### CI/CD

- **Pipeline**: GitHub Actions
- **Container Registry**: Amazon ECR
- **Configuration Management**: Terraform
- **Secret Management**: AWS Secrets Manager

## Key Technical Components

### Location Services Architecture

1. **Location Update Flow**

```
Mobile App → API Gateway → Location Processing Service → Redis Cache →
Matching Service → Notification Service
```

2. **Geofencing Implementation**

- Geohash-based proximity detection
- Dynamic radius adjustment
- Battery-efficient location updates
- Bluetooth LE for enhanced accuracy

### Real-time Matching System

1. **Matching Algorithm Components**

- Spatial indexing using PostGIS
- Interest-based weighted scoring
- Time window compatibility
- Safety score consideration

2. **Notification Pipeline**

```
Match Detection → Safety Check → Push Notification Service →
Mobile App
```

### Security Architecture

1. **Data Protection**

- End-to-end encryption for messages
- Location data encryption at rest
- Temporary data storage with automatic deletion
- Zero-knowledge proof for location verification

2. **Authentication System**

- OAuth 2.0 with PKCE
- JWT for session management
- Biometric authentication support
- Rate limiting and brute force protection

### Privacy Implementation

1. **Location Privacy**

- Approximate location sharing
- Private zones implementation
- Temporary location caching
- Delayed location updates

2. **Data Lifecycle**

- Automatic data expiration
- Configurable retention policies
- GDPR compliance tooling
- Data anonymization pipeline

## Scaling Considerations

### Horizontal Scaling

- Kubernetes-based microservices
- Regional deployment strategy
- Load balancing across zones
- Database sharding strategy

### Performance Optimization

- CDN for static assets
- Redis caching layer
- Database query optimization
- Async processing for non-critical operations

## Development Workflow

### Local Development

- Docker Compose for local services
- Mock location services
- Automated testing suite
- Hot reload capabilities

### Testing Strategy

- Unit tests with high coverage
- Integration tests for critical paths
- Performance testing suite
- Security scanning pipeline

## Security Measures

### Application Security

- OWASP compliance
- Regular security audits
- Penetration testing
- Vulnerability scanning

### Data Security

- Encryption at rest and in transit
- Regular backup strategy
- Disaster recovery plan
- Data access logging

## Monitoring & Alerting

### Key Metrics

- Location service latency
- Matching service performance
- User engagement metrics
- Error rates and types

### Alert Systems

- PagerDuty integration
- Automated incident response
- Escalation policies
- Status page updates

## Future Considerations

### Planned Technical Improvements

- ML-based matching optimization
- Enhanced battery optimization
- Blockchain-based trust system
- AR features for meetup spots

### Scalability Roadmap

- Multi-region deployment
- Enhanced caching strategy
- Improved matching algorithms
- Advanced safety features

---

## Note

This technical architecture is designed to be both scalable and maintainable while prioritizing user privacy and safety. Regular reviews and updates will be conducted to incorporate new technologies and security measures as they become available.
There's no current implementation of Rust or Elixir/Phoenix in the codebase.

# Currently using:

The spatial calculations, real-time location matching, and WebSocket features are currently implemented using Go and TypeScript.

Go for the WebSocket and real-time features:
go
CopyInsert
// In backend/services/core-api/internal/websocket/hub.go
type Hub struct {
clients map[*Client]bool
userClients map[uuid.UUID][]*Client
broadcast chan []byte
register chan *Client
unregister chan \*Client
mu sync.RWMutex
}
TypeScript/Node.js for location services:
typescript
CopyInsert
// In src/services/location/location.service.ts
export class LocationService {
// Location service implementation
// Handles geohashing and spatial calculations
}

# Here's why we might want to stick with the current implementation rather than switching to Rust and Elixir:

- Current Go Implementation Benefits:
  Already has a working WebSocket hub implementation
  Good performance characteristics for concurrent connections
  Strong type system and memory safety
  Excellent standard library support
  Simple deployment and maintenance
- Current TypeScript/Node.js Benefits:
  Seamless integration with our Next.js frontend
  Rich ecosystem of location and spatial libraries
  Easy to maintain and modify
  Team familiarity (based on the codebase)
  While Rust and Elixir are excellent technologies:

- Rust would offer:
  Extremely high performance for spatial calculations
  Zero-cost abstractions
  Memory safety without garbage collection
- Elixir/Phoenix would offer:
  Excellent WebSocket handling through Phoenix Channels
  Built-in PubSub system
  Fault tolerance through the BEAM VM

- However, switching now would require:
  Rewriting existing working implementations
  Additional deployment complexity
  Potential team training
  Migration of existing data and services

Unless there are specific performance bottlenecks or scaling issues with the current implementation, I would recommend continuing with the current Go/TypeScript stack as it's already proven to work well for our needs.

- If you do want to make the switch, we should first:
  Identify specific performance metrics that need improvement
  Create a gradual migration plan
  Set up proper benchmarking to compare implementations
  Consider the maintenance and deployment overhead
