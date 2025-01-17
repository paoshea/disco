# Deployment Documentation

## Overview

This document outlines the deployment process and configuration for the Disco backend services.

## Environments

### Development
- **URL**: `http://localhost:8000`
- **Purpose**: Local development
- **Infrastructure**: Docker Compose

### Staging
- **URL**: `https://api-staging.disco.com`
- **Purpose**: Testing and QA
- **Infrastructure**: AWS EKS

### Production
- **URL**: `https://api.disco.com`
- **Purpose**: Production environment
- **Infrastructure**: AWS EKS

## Prerequisites

1. **Tools**
   - Docker
   - kubectl
   - AWS CLI
   - Helm

2. **Access**
   - AWS credentials
   - GitHub access
   - Docker registry access

3. **Environment Variables**
   ```bash
   # AWS Configuration
   AWS_REGION=us-west-2
   AWS_ACCOUNT_ID=123456789

   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=disco
   DB_USER=disco_user

   # Redis
   REDIS_HOST=localhost
   REDIS_PORT=6379

   # JWT
   JWT_SECRET=your-secret-key
   JWT_EXPIRATION=24h

   # Services
   API_PORT=8000
   WEBSOCKET_PORT=8001
   ```

## Local Development

1. **Start Development Environment**
   ```bash
   # Clone repository
   git clone https://github.com/disco/backend.git
   cd backend

   # Install dependencies
   npm install

   # Start services
   docker-compose up -d
   ```

2. **Run Migrations**
   ```bash
   npm run migrate:up
   ```

3. **Seed Data**
   ```bash
   npm run seed:dev
   ```

## Kubernetes Deployment

### Cluster Setup

1. **Create EKS Cluster**
   ```bash
   eksctl create cluster \
     --name disco-cluster \
     --region us-west-2 \
     --nodegroup-name standard-workers \
     --node-type t3.medium \
     --nodes 3 \
     --nodes-min 1 \
     --nodes-max 4 \
     --managed
   ```

2. **Install Helm Charts**
   ```bash
   # Add Helm repositories
   helm repo add bitnami https://charts.bitnami.com/bitnami

   # Update repositories
   helm repo update

   # Install Ingress Controller
   helm install nginx-ingress ingress-nginx/ingress-nginx

   # Install Cert Manager
   helm install cert-manager jetstack/cert-manager
   ```

### Service Deployment

1. **Deploy Database**
   ```bash
   helm install postgresql bitnami/postgresql \
     --set auth.postgresPassword=$DB_PASSWORD
   ```

2. **Deploy Redis**
   ```bash
   helm install redis bitnami/redis \
     --set auth.password=$REDIS_PASSWORD
   ```

3. **Deploy Services**
   ```bash
   # Apply ConfigMaps and Secrets
   kubectl apply -f k8s/config/

   # Deploy services
   kubectl apply -f k8s/services/
   ```

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: |
          npm install
          npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Configure AWS
        uses: aws-actions/configure-aws-credentials@v1

      - name: Build and push
        run: |
          docker build -t disco-backend .
          docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/disco-backend

      - name: Deploy to EKS
        run: |
          kubectl apply -f k8s/
```

## Monitoring

### Setup Monitoring Stack

1. **Install Prometheus**
   ```bash
   helm install prometheus prometheus-community/prometheus
   ```

2. **Install Grafana**
   ```bash
   helm install grafana grafana/grafana
   ```

3. **Configure Alerts**
   ```bash
   kubectl apply -f monitoring/alerts/
   ```

## Backup and Recovery

### Database Backups

1. **Automated Backups**
   ```bash
   # Configure backup schedule
   kubectl apply -f k8s/backup/cronjob.yaml
   ```

2. **Manual Backup**
   ```bash
   # Create backup
   kubectl exec -it postgresql-0 -- pg_dump -U postgres > backup.sql
   ```

3. **Restore from Backup**
   ```bash
   # Restore database
   kubectl exec -it postgresql-0 -- psql -U postgres < backup.sql
   ```

## Troubleshooting

### Common Issues

1. **Pod Crashes**
   ```bash
   # Check pod logs
   kubectl logs <pod-name>

   # Describe pod
   kubectl describe pod <pod-name>
   ```

2. **Database Connection Issues**
   ```bash
   # Check database status
   kubectl exec -it postgresql-0 -- pg_isready

   # Check connection from service
   kubectl exec -it <service-pod> -- nc -zv postgresql 5432
   ```

3. **Memory Issues**
   ```bash
   # Check memory usage
   kubectl top pods
   ```

## Security

### SSL/TLS Configuration

1. **Generate Certificates**
   ```bash
   # Install cert-manager
   kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.8.0/cert-manager.yaml

   # Create certificate
   kubectl apply -f k8s/certificates/
   ```

2. **Configure Ingress**
   ```bash
   # Apply SSL configuration
   kubectl apply -f k8s/ingress/ssl.yaml
   ```

## Best Practices

1. **Deployment**
   - Use rolling updates
   - Implement health checks
   - Set resource limits

2. **Security**
   - Regular security audits
   - Keep dependencies updated
   - Monitor security alerts

3. **Monitoring**
   - Set up alerts
   - Monitor resource usage
   - Track error rates

4. **Backup**
   - Regular backup testing
   - Multiple backup locations
   - Document recovery procedures
