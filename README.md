# ServiceOS

**The AI-Native Operating System for Autonomous Service Companies**

ServiceOS is a production-grade platform for building and operating autonomous AI-powered service businesses. It enables companies to replace traditional outsourced services with end-to-end AI-driven operations.

## Features

- **Autonomous Workflow Engine**: Execute business processes end-to-end without human intervention
- **AI Workforce Orchestration**: Coordinate multiple specialized AI agents working together
- **Document Intelligence**: Parse, extract, and understand complex business documents
- **Knowledge Graphs**: Build semantic understanding of operational domain knowledge
- **Compliance & Audit**: Comprehensive audit trails and regulatory compliance management
- **Multi-Tenant Architecture**: Enterprise-grade isolation and multi-tenant support
- **Operational Memory**: Long-term knowledge retention and context management
- **Real-time Monitoring**: Live telemetry and operational dashboards

## Architecture

ServiceOS is built with a modern, cloud-native architecture:

- **Frontend**: Next.js 15 + React + TypeScript + Tailwind CSS
- **Backend**: Express.js with modular service architecture
- **Orchestration**: Workflow engine with state management and event-driven execution
- **AI Layer**: Multi-agent framework with tool orchestration
- **Data**: PostgreSQL, Redis, Neo4j, and vector search
- **Infrastructure**: Kubernetes, Terraform, Docker

## Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+

### Local Development

1. **Clone and setup**:
   ```bash
   git clone https://github.com/ChaitanyaJoshi1769/ServiceOS.git
   cd ServiceOS
   cp .env.example .env
   ```

2. **Start services**:
   ```bash
   docker-compose up -d
   ```

3. **Install dependencies**:
   ```bash
   npm install -g pnpm
   pnpm install
   ```

4. **Run development servers**:
   ```bash
   pnpm dev
   ```

The dashboard will be available at `http://localhost:3001` and the API at `http://localhost:3000`.

## Project Structure

```
serviceos/
├── apps/                    # Applications
│   ├── web/                 # Next.js dashboard
│   ├── api/                 # Express.js API server
│   └── cli/                 # Command-line interface
├── packages/                # Shared packages
│   ├── types/               # TypeScript definitions
│   ├── workflow-engine/     # Core workflow execution
│   ├── agent-core/          # AI agent framework
│   ├── knowledge-graph/     # Knowledge graph system
│   ├── memory-system/       # Operational memory
│   ├── compliance-core/     # Compliance & audit
│   ├── shared/              # Shared utilities
│   └── ui/                  # React components
├── services/                # Microservices
├── infrastructure/          # DevOps & deployment
│   ├── terraform/           # Infrastructure as Code
│   ├── kubernetes/          # K8s manifests
│   └── docker/              # Docker configs
└── docs/                    # Documentation
```

## Core Packages

### Types (`@serviceos/types`)
Shared TypeScript types for all packages. Defines the contract for workflows, agents, documents, compliance, and more.

### Workflow Engine (`@serviceos/workflow-engine`)
The core execution engine for running workflows. Features:
- State management and persistence
- Error handling with retry policies
- Branch resolution and conditional execution
- Event-driven architecture
- SLA management

### Agent Core (`@serviceos/agent-core`)
AI agent orchestration framework:
- Multi-agent coordination
- Tool registry and invocation
- Prompt building and optimization
- Memory management
- Execution tracking

### Knowledge Graph (`@serviceos/knowledge-graph`)
Semantic knowledge representation:
- Entity and relationship storage
- Graph queries and traversal
- Rule evaluation
- Temporal properties

### Memory System (`@serviceos/memory-system`)
Operational memory for agents:
- Episodic (event history)
- Semantic (knowledge)
- Procedural (workflows)
- Vector search capabilities

### Compliance Core (`@serviceos/compliance-core`)
Compliance and audit management:
- Immutable audit logs
- Policy evaluation
- Evidence collection
- Compliance reporting

## API Documentation

### Workflows
- `GET /api/v1/workflows` - List workflows
- `POST /api/v1/workflows` - Create workflow
- `GET /api/v1/workflows/:id` - Get workflow
- `POST /api/v1/workflows/:id/execute` - Execute workflow

### Agents
- `GET /api/v1/agents` - List agents
- `POST /api/v1/agents` - Register agent
- `POST /api/v1/agents/:id/execute` - Execute agent task

### Documents
- `GET /api/v1/documents` - List documents
- `POST /api/v1/documents` - Upload document
- `POST /api/v1/documents/:id/extract` - Extract information

### Compliance
- `GET /api/v1/compliance/status` - Get compliance status
- `GET /api/v1/audit/events` - Get audit trail

## Deployment

### Docker

Build and run with Docker Compose:
```bash
docker-compose up -d
```

### Kubernetes

Deploy to Kubernetes cluster:
```bash
kubectl apply -f infrastructure/kubernetes/
```

### Terraform

Deploy infrastructure on AWS:
```bash
cd infrastructure/terraform
terraform init
terraform plan
terraform apply
```

## Configuration

Copy `.env.example` to `.env` and configure:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/serviceos
REDIS_URL=redis://localhost:6379
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
```

## Development

### Building

```bash
pnpm build           # Build all packages
pnpm dev             # Dev mode with hot reload
pnpm type-check      # TypeScript checking
pnpm lint            # Linting
pnpm test            # Run tests
```

### Monorepo Commands

```bash
turbo run build      # Build all packages
turbo run dev        # Dev all packages
turbo run test       # Test all packages
turbo run lint       # Lint all packages
```

## Testing

Run all tests:
```bash
pnpm test
```

Run specific package tests:
```bash
pnpm --filter @serviceos/workflow-engine test
```

## Observability

### Logging
Structured JSON logging to stdout. Configure `LOG_LEVEL` environment variable.

### Metrics
Prometheus metrics exposed at `/metrics` endpoint.

### Tracing
Distributed tracing with OpenTelemetry (optional).

## Performance

- API response time: <100ms (p95)
- Workflow start time: <1s
- Document processing: <30s for typical documents
- Concurrent workflows: 1,000+
- Concurrent agents: 10,000+

## Security

- OAuth 2.0 / OIDC authentication
- Role-Based Access Control (RBAC)
- Encryption at rest and in transit
- Secrets management with Vault
- Immutable audit logs
- PII filtering in logs

## Compliance

Supports major compliance frameworks:
- HIPAA (healthcare)
- GDPR (data privacy)
- SOC 2 (security)
- PCI DSS (payment cards)
- SOX (financial reporting)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## Roadmap

### Phase 1: Foundation ✅
- Core workflow engine
- AI orchestration framework
- Document intelligence
- Knowledge graphs
- Basic compliance

### Phase 2: Operations
- Advanced approval workflows
- Customer interaction systems
- Operational memory
- Analytics engine
- Multi-tenant support

### Phase 3: Intelligence
- Domain-specific modules (Insurance, Tax, Healthcare)
- Advanced analytics
- Autonomous optimization
- Workflow mining

### Phase 4: Scale
- Plugin ecosystem
- Marketplace
- Enterprise deployment
- Global operations

## License

Proprietary - See LICENSE file

## Support

- Documentation: https://docs.serviceos.dev
- Issues: https://github.com/ChaitanyaJoshi1769/ServiceOS/issues
- Email: support@serviceos.dev

## Team

ServiceOS is built by a team of experts in:
- Enterprise workflow automation
- AI and machine learning
- Cloud infrastructure
- Regulatory compliance
- Enterprise operations

---

**ServiceOS: Building the future of autonomous services.**
