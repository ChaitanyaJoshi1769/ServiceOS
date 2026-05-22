# ServiceOS Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [Docker Deployment](#docker-deployment)
4. [Kubernetes Deployment](#kubernetes-deployment)
5. [Multi-Region Deployment](#multi-region-deployment)
6. [Production Configuration](#production-configuration)
7. [Monitoring & Observability](#monitoring--observability)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software
- Node.js 18+ or Docker 24+
- Git
- kubectl (for Kubernetes deployments)
- Terraform 1.5+ (for infrastructure provisioning)
- PostgreSQL client tools

### System Requirements
- **Development**: 2 CPU cores, 4GB RAM, 20GB disk
- **Staging**: 4 CPU cores, 8GB RAM, 100GB disk
- **Production**: 8+ CPU cores, 32GB+ RAM, 500GB+ disk

### Cloud Credentials
- AWS: IAM credentials with EC2, ECS, RDS permissions
- GCP: Service account with Compute, Cloud SQL, GCS permissions
- Azure: Service principal with permissions for AKS, Cosmos DB

## Local Development

### Quick Start with Docker Compose

```bash
# Clone repository
git clone https://github.com/ChaitanyaJoshi1769/ServiceOS.git
cd ServiceOS

# Start services
docker-compose up -d

# Wait for services to be ready
docker-compose ps

# Access services
# API: http://localhost:3000
# Web UI: http://localhost:3001
# PostgreSQL: localhost:5432
# Redis: localhost:6379
```

### Manual Setup

```bash
# Install dependencies
npm install
npx turbo install

# Build all packages
npx turbo build

# Start services in development mode
npm run dev

# In separate terminals:
# Terminal 1: Backend
cd apps/api && npm run dev

# Terminal 2: Frontend
cd apps/web && npm run dev

# Terminal 3: Database
docker run -d --name postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=serviceos \
  -p 5432:5432 \
  postgres:15

# Terminal 4: Redis
docker run -d --name redis \
  -p 6379:6379 \
  redis:7
```

### Environment Variables

Create `.env.local`:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/serviceos
REDIS_URL=redis://localhost:6379

# API Configuration
API_PORT=3000
API_HOST=localhost
NODE_ENV=development

# Authentication
JWT_SECRET=your-secret-key-here
JWT_EXPIRY=24h

# AI Models
ANTHROPIC_API_KEY=your-api-key
OPENAI_API_KEY=your-api-key

# File Storage
STORAGE_TYPE=local
STORAGE_PATH=./data/uploads

# Logging
LOG_LEVEL=debug
```

## Docker Deployment

### Build Docker Image

```bash
# Build production image
docker build -t serviceos:latest .

# Tag for registry
docker tag serviceos:latest myregistry.azurecr.io/serviceos:latest

# Push to registry
docker push myregistry.azurecr.io/serviceos:latest
```

### Docker Compose for Staging

```bash
# Start all services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f api

# Scale services
docker-compose up -d --scale worker=3

# Stop services
docker-compose down
```

### Docker Network & Volumes

```bash
# Create network
docker network create serviceos-network

# Create volumes for persistence
docker volume create serviceos-postgres-data
docker volume create serviceos-redis-data

# Run with volumes
docker run -d \
  --name serviceos-api \
  --network serviceos-network \
  -v serviceos-postgres-data:/var/lib/postgresql \
  -e DATABASE_URL=postgresql://postgres:password@postgres:5432/serviceos \
  -p 3000:3000 \
  serviceos:latest
```

## Kubernetes Deployment

### Prerequisites

```bash
# Create namespace
kubectl create namespace serviceos
kubectl config set-context --current --namespace=serviceos

# Create image pull secret (if using private registry)
kubectl create secret docker-registry regcred \
  --docker-server=myregistry.azurecr.io \
  --docker-username=<username> \
  --docker-password=<password> \
  --docker-email=admin@example.com
```

### Deploy with Manifests

```bash
# Apply database schema
kubectl apply -f infrastructure/kubernetes/postgres-init.yaml
kubectl apply -f infrastructure/kubernetes/redis-init.yaml

# Deploy API service
kubectl apply -f infrastructure/kubernetes/api-deployment.yaml
kubectl apply -f infrastructure/kubernetes/api-service.yaml

# Deploy web frontend
kubectl apply -f infrastructure/kubernetes/web-deployment.yaml
kubectl apply -f infrastructure/kubernetes/web-service.yaml

# Deploy ingress
kubectl apply -f infrastructure/kubernetes/ingress.yaml
```

### Using Helm Charts

```bash
# Create Helm chart
helm create serviceos

# Install
helm install serviceos ./serviceos \
  --namespace serviceos \
  --set image.repository=myregistry.azurecr.io/serviceos \
  --set image.tag=latest \
  --set replicaCount=3

# Upgrade
helm upgrade serviceos ./serviceos \
  --namespace serviceos \
  --set image.tag=v2.0.0

# Rollback
helm rollback serviceos 1
```

### Scaling & Auto-Scaling

```bash
# Manual scaling
kubectl scale deployment serviceos-api --replicas=5

# Horizontal Pod Autoscaler
kubectl autoscale deployment serviceos-api \
  --min=2 --max=10 \
  --cpu-percent=80

# View HPA status
kubectl get hpa
```

### Persistent Storage

```bash
# Create PersistentVolume and PersistentVolumeClaim
kubectl apply -f infrastructure/kubernetes/storage.yaml

# Verify
kubectl get pv
kubectl get pvc

# Backup data
kubectl exec -it <pod-name> -- pg_dump serviceos > backup.sql

# Restore data
kubectl exec -i <pod-name> -- psql serviceos < backup.sql
```

## Multi-Region Deployment

### AWS Multi-Region Setup

```bash
# Terraform for multi-region deployment
cd infrastructure/terraform

# Initialize Terraform
terraform init

# Plan multi-region deployment
terraform plan \
  -var="regions=us-east-1,eu-west-1,ap-southeast-1" \
  -var="environment=production"

# Apply configuration
terraform apply

# Output: Load balancer IPs and endpoints
terraform output
```

### Database Replication

```bash
# Set up PostgreSQL replication
# Primary region: us-east-1
# Replica regions: eu-west-1, ap-southeast-1

# Create replication user on primary
CREATE USER replicator WITH REPLICATION ENCRYPTED PASSWORD 'password';

# Configure postgres.conf on primary
wal_level = replica
max_wal_senders = 3
max_replication_slots = 3

# Backup primary and restore to replicas
pg_basebackup -h primary-host -D /var/lib/postgresql/15/main \
  -U replicator -v -P -W

# Create replication slot on replica
SELECT * FROM pg_create_physical_replication_slot('replica_slot');
```

### Failover Configuration

```bash
# Active-Passive failover
# Route all traffic to primary
# Standby replicas ready for promotion

# Active-Active failover (using pglogical)
# Both regions accept writes
# Logical replication syncs changes

# Test failover
# 1. Stop primary region services
# 2. Promote replica to primary
# 3. Update DNS/load balancer
# 4. Resume write operations
```

### Global Load Balancing

```bash
# Create Route 53 health checks
aws route53 create-health-check \
  --type HTTPS \
  --resource-path /health \
  --fqdn api.serviceos.com

# Create routing policy
aws route53 change-resource-record-sets \
  --hosted-zone-id Z123456 \
  --change-batch file://routing-policy.json
```

## Production Configuration

### TLS/SSL Configuration

```bash
# Generate self-signed certificate (testing only)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout private.key -out certificate.crt

# Use Let's Encrypt for production
certbot certonly --webroot -w /var/www/html \
  -d api.serviceos.com -d serviceos.com

# Create Kubernetes secret
kubectl create secret tls serviceos-tls \
  --cert=certificate.crt \
  --key=private.key
```

### Secrets Management

```bash
# Using HashiCorp Vault
vault secrets enable database
vault write database/config/serviceos \
  plugin_name=postgresql-database-plugin \
  allowed_roles="readonly,readwrite" \
  connection_url="postgresql://{{username}}:{{password}}@postgres:5432/serviceos" \
  username="vault" \
  password="vault-password"

# Using AWS Secrets Manager
aws secretsmanager create-secret \
  --name serviceos/db-password \
  --secret-string '{"password":"secure-password"}'
```

### High Availability Database

```bash
# PostgreSQL High Availability with Patroni
helm install patroni ./patroni \
  --set postgresql.replication.password=reppassword \
  --set postgresql.password=password \
  --namespace serviceos

# Monitor cluster status
kubectl exec -it patroni-0 -- patronictl list

# Perform manual failover
kubectl exec -it patroni-0 -- patronictl failover
```

### Backup & Disaster Recovery

```bash
# Automated daily backups
*/2 * * * * pg_dump serviceos | gzip > /backups/serviceos-$(date +\%Y\%m\%d-\%H\%M\%S).sql.gz

# Backup to S3
aws s3 sync /backups s3://serviceos-backups/ --delete

# Restore from backup
gunzip < serviceos-20240523-120000.sql.gz | psql serviceos

# Test recovery procedure monthly
# Document recovery time objective (RTO): < 4 hours
# Document recovery point objective (RPO): < 1 hour
```

### Rate Limiting & DDoS Protection

```bash
# Nginx rate limiting
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/s;
limit_req zone=api_limit burst=200 nodelay;

# AWS WAF configuration
aws wafv2 create-web-acl \
  --name serviceos-waf \
  --scope REGIONAL \
  --default-action Block={} \
  --rules file://waf-rules.json
```

## Monitoring & Observability

### Prometheus Metrics

```bash
# Deploy Prometheus
kubectl apply -f infrastructure/kubernetes/prometheus-config.yaml

# Define recording rules
groups:
- name: serviceos
  rules:
  - record: rate:workflow_execution:1m
    expr: rate(workflow_execution_total[1m])
```

### Grafana Dashboards

```bash
# Deploy Grafana
helm install grafana grafana/grafana \
  --namespace serviceos \
  --set adminPassword=admin

# Import dashboards
# 1. Open http://localhost:3000
# 2. Add Prometheus datasource
# 3. Import dashboard JSON from infrastructure/grafana/
```

### Logging with ELK Stack

```bash
# Deploy Elasticsearch
helm install elasticsearch elastic/elasticsearch \
  --namespace serviceos

# Deploy Kibana
helm install kibana elastic/kibana \
  --namespace serviceos

# Configure Filebeat
kubectl apply -f infrastructure/kubernetes/filebeat-config.yaml
```

### Distributed Tracing

```bash
# Deploy Jaeger
helm install jaeger jaegertracing/jaeger \
  --namespace serviceos

# Configure application
export OTEL_EXPORTER_OTLP_ENDPOINT=http://jaeger-collector:4317
export OTEL_EXPORTER_OTLP_PROTOCOL=grpc
```

### Custom Alerts

```yaml
# Prometheus alerting rules
groups:
- name: serviceos-alerts
  rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
    for: 5m
    
  - alert: WorkflowExecutionSlow
    expr: histogram_quantile(0.95, workflow_execution_duration_seconds) > 60
    for: 10m
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Failures

```bash
# Check PostgreSQL connectivity
psql -h localhost -U postgres -d serviceos -c "SELECT 1"

# Verify environment variables
echo $DATABASE_URL

# Check container logs
docker logs serviceos-postgres

# Verify credentials in Kubernetes secret
kubectl get secret serviceos-db -o jsonpath='{.data.password}' | base64 -d
```

#### 2. High Memory Usage

```bash
# Check memory consumption
kubectl top pod

# Identify pod consuming most memory
kubectl top pod --sort-by=memory

# Adjust resource limits
kubectl patch deployment serviceos-api -p \
  '{"spec":{"template":{"spec":{"containers":[{"name":"api","resources":{"limits":{"memory":"2Gi"}}}]}}}}'
```

#### 3. Slow API Responses

```bash
# Check API latency metrics
curl http://api.serviceos.com/metrics | grep http_request_duration

# Identify slow endpoints
kubectl logs -l app=api | grep "duration_ms" | sort -t: -k3 -rn | head

# Enable query logging
kubectl set env deployment/serviceos-api LOG_LEVEL=debug
```

#### 4. Worker/Agent Issues

```bash
# Check worker status
kubectl get pods -l component=worker

# Inspect worker logs
kubectl logs -l component=worker --tail=100

# Restart workers
kubectl rollout restart deployment serviceos-worker
```

### Debug Commands

```bash
# Port forward to services
kubectl port-forward svc/serviceos-api 3000:3000
kubectl port-forward svc/postgres 5432:5432

# Execute database queries
kubectl exec -it <postgres-pod> -- psql -U postgres -d serviceos -c "SELECT * FROM audit_logs LIMIT 10;"

# Check API health
curl http://localhost:3000/health

# Stream logs
kubectl logs -f deployment/serviceos-api

# Get pod details
kubectl describe pod <pod-name>
```

### Performance Tuning

```bash
# Database connection pooling
export DATABASE_POOL_SIZE=20
export DATABASE_MAX_IDLE_TIME=900

# Redis memory optimization
CONFIG SET maxmemory 2gb
CONFIG SET maxmemory-policy allkeys-lru

# Node.js memory settings
export NODE_OPTIONS="--max-old-space-size=4096"
```

## Support & Resources

- **Documentation**: https://docs.serviceos.com
- **GitHub Issues**: https://github.com/ChaitanyaJoshi1769/ServiceOS/issues
- **Community Slack**: #serviceos on ServiceOS Slack workspace
- **Email Support**: support@serviceos.com

---

Last Updated: 2024-05-23
ServiceOS v1.0.0
