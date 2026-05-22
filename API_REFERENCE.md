# ServiceOS API Reference

Comprehensive REST API documentation for ServiceOS.

## Base URL
```
https://api.serviceos.com/v1
```

## Authentication

All requests require authentication via API key in the Authorization header:

```bash
Authorization: Bearer YOUR_API_KEY
```

Or use JWT token:

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## Workflows API

### Create Workflow

Creates a new workflow definition.

**Endpoint:** `POST /workflows`

**Request Body:**
```json
{
  "name": "Policy Onboarding",
  "description": "Complete policy onboarding workflow",
  "steps": [
    {
      "id": "step1",
      "type": "action",
      "action": "validatePolicy",
      "input": { "document": "$.document" }
    }
  ]
}
```

**Response (201):**
```json
{
  "id": "wf-123456",
  "name": "Policy Onboarding",
  "createdAt": "2024-05-23T10:30:00Z",
  "version": "1.0.0"
}
```

### Get Workflow

Retrieves a workflow definition.

**Endpoint:** `GET /workflows/{workflowId}`

**Response (200):**
```json
{
  "id": "wf-123456",
  "name": "Policy Onboarding",
  "steps": [...],
  "createdAt": "2024-05-23T10:30:00Z"
}
```

### List Workflows

Lists all workflows in an organization.

**Endpoint:** `GET /workflows`

**Query Parameters:**
- `limit`: Number of results (default: 20, max: 100)
- `offset`: Pagination offset (default: 0)
- `search`: Filter by name or description

**Response (200):**
```json
{
  "workflows": [
    {
      "id": "wf-123456",
      "name": "Policy Onboarding",
      "updatedAt": "2024-05-23T10:30:00Z"
    }
  ],
  "total": 42,
  "limit": 20,
  "offset": 0
}
```

### Execute Workflow

Starts execution of a workflow.

**Endpoint:** `POST /workflows/{workflowId}/execute`

**Request Body:**
```json
{
  "input": {
    "document": "base64-encoded-document",
    "customerId": "cust-123"
  },
  "organizationId": "org-456"
}
```

**Response (202):**
```json
{
  "executionId": "exec-789",
  "workflowId": "wf-123456",
  "status": "running",
  "startedAt": "2024-05-23T10:35:00Z"
}
```

## Executions API

### Get Execution Status

Retrieves the current status of a workflow execution.

**Endpoint:** `GET /executions/{executionId}`

**Response (200):**
```json
{
  "executionId": "exec-789",
  "workflowId": "wf-123456",
  "status": "running",
  "currentStep": "step2",
  "progress": 45,
  "startedAt": "2024-05-23T10:35:00Z",
  "steps": [
    {
      "id": "step1",
      "status": "completed",
      "startedAt": "2024-05-23T10:35:00Z",
      "completedAt": "2024-05-23T10:35:05Z",
      "duration": 5000
    }
  ]
}
```

### Cancel Execution

Cancels a running workflow execution.

**Endpoint:** `POST /executions/{executionId}/cancel`

**Response (200):**
```json
{
  "executionId": "exec-789",
  "status": "cancelled",
  "cancelledAt": "2024-05-23T10:40:00Z"
}
```

### List Executions

Lists executions for a workflow.

**Endpoint:** `GET /workflows/{workflowId}/executions`

**Query Parameters:**
- `status`: Filter by status (running, completed, failed, cancelled)
- `limit`: Number of results (default: 20)
- `offset`: Pagination offset (default: 0)

**Response (200):**
```json
{
  "executions": [
    {
      "executionId": "exec-789",
      "status": "completed",
      "startedAt": "2024-05-23T10:35:00Z",
      "completedAt": "2024-05-23T10:40:00Z"
    }
  ],
  "total": 156,
  "limit": 20,
  "offset": 0
}
```

## Agents API

### Register Agent

Registers a new agent.

**Endpoint:** `POST /agents`

**Request Body:**
```json
{
  "name": "PolicyValidationAgent",
  "description": "Validates insurance policies",
  "systemPrompt": "You are a policy validation specialist",
  "model": "claude-3-opus",
  "tools": ["validatePolicy", "extractInfo"],
  "maxTokens": 4096
}
```

**Response (201):**
```json
{
  "agentId": "agent-123",
  "name": "PolicyValidationAgent",
  "createdAt": "2024-05-23T10:30:00Z"
}
```

### Get Agent Status

Retrieves agent status and metrics.

**Endpoint:** `GET /agents/{agentId}`

**Response (200):**
```json
{
  "agentId": "agent-123",
  "name": "PolicyValidationAgent",
  "status": "active",
  "tasksCompleted": 1245,
  "averageAccuracy": 0.94,
  "averageResponseTime": 2500,
  "lastActiveAt": "2024-05-23T10:35:00Z"
}
```

### Assign Task to Agent

Assigns a task to an agent for execution.

**Endpoint:** `POST /agents/{agentId}/tasks`

**Request Body:**
```json
{
  "task": "Validate the attached policy document for compliance",
  "documents": ["base64-encoded-policy"],
  "context": {
    "policyType": "homeowners",
    "customerType": "individual"
  }
}
```

**Response (202):**
```json
{
  "taskId": "task-456",
  "agentId": "agent-123",
  "status": "running",
  "startedAt": "2024-05-23T10:35:00Z"
}
```

## Approvals API

### Create Approval Request

Creates an approval request for human review.

**Endpoint:** `POST /approvals`

**Request Body:**
```json
{
  "title": "Policy Renewal Approval",
  "description": "Review and approve policy renewal",
  "assignees": ["manager@company.com"],
  "dueDate": "2024-05-30T00:00:00Z",
  "priority": "high",
  "context": {
    "policyId": "pol-789",
    "customerId": "cust-123"
  }
}
```

**Response (201):**
```json
{
  "approvalId": "appr-123",
  "status": "pending",
  "createdAt": "2024-05-23T10:35:00Z",
  "dueDate": "2024-05-30T00:00:00Z"
}
```

### Submit Approval Decision

Submits an approval or rejection decision.

**Endpoint:** `POST /approvals/{approvalId}/decide`

**Request Body:**
```json
{
  "decision": "approved",
  "comment": "Approved after review",
  "decidedBy": "manager@company.com"
}
```

**Response (200):**
```json
{
  "approvalId": "appr-123",
  "status": "approved",
  "decidedAt": "2024-05-25T14:20:00Z",
  "decidedBy": "manager@company.com"
}
```

### Get Approval Status

Retrieves the status of an approval request.

**Endpoint:** `GET /approvals/{approvalId}`

**Response (200):**
```json
{
  "approvalId": "appr-123",
  "title": "Policy Renewal Approval",
  "status": "approved",
  "pendingApprovers": [],
  "approvals": [
    {
      "approver": "manager@company.com",
      "decision": "approved",
      "decidedAt": "2024-05-25T14:20:00Z"
    }
  ]
}
```

## Documents API

### Upload Document

Uploads a document for processing.

**Endpoint:** `POST /documents`

**Request Body:** (multipart/form-data)
```
file: <binary file content>
metadata: {"documentType": "policy", "customerId": "cust-123"}
```

**Response (201):**
```json
{
  "documentId": "doc-456",
  "filename": "policy.pdf",
  "uploadedAt": "2024-05-23T10:35:00Z",
  "size": 245632
}
```

### Extract Information

Extracts structured information from a document.

**Endpoint:** `POST /documents/{documentId}/extract`

**Request Body:**
```json
{
  "fields": ["policyNumber", "effectiveDate", "premiumAmount"],
  "extractionType": "structured"
}
```

**Response (200):**
```json
{
  "documentId": "doc-456",
  "extractedData": {
    "policyNumber": "POL-2024-001",
    "effectiveDate": "2024-06-01",
    "premiumAmount": 1250.00
  },
  "confidence": 0.98
}
```

## Compliance API

### Get Audit Events

Retrieves audit trail events.

**Endpoint:** `GET /audit/events`

**Query Parameters:**
- `organizationId`: Filter by organization
- `entityType`: Filter by entity type (workflow, agent, document, etc.)
- `action`: Filter by action (created, updated, deleted, executed, etc.)
- `startDate`: Filter by start date (ISO 8601)
- `endDate`: Filter by end date (ISO 8601)
- `limit`: Number of results (default: 20)

**Response (200):**
```json
{
  "events": [
    {
      "eventId": "evt-123",
      "timestamp": "2024-05-23T10:35:00Z",
      "actor": "user@company.com",
      "action": "workflow_executed",
      "entityType": "workflow",
      "entityId": "wf-456",
      "changes": {
        "status": "completed"
      }
    }
  ],
  "total": 5432,
  "limit": 20
}
```

### Get Compliance Status

Retrieves compliance and regulatory status.

**Endpoint:** `GET /compliance/status`

**Response (200):**
```json
{
  "organizationId": "org-123",
  "overallCompliance": "compliant",
  "standards": {
    "hipaa": {
      "status": "compliant",
      "lastAudit": "2024-05-20",
      "nextAudit": "2024-08-20"
    },
    "gdpr": {
      "status": "compliant",
      "lastAudit": "2024-04-15",
      "nextAudit": "2024-07-15"
    },
    "soc2": {
      "status": "compliant",
      "lastAudit": "2024-03-01",
      "nextAudit": "2024-09-01"
    }
  }
}
```

## Analytics API

### Get Dashboard Metrics

Retrieves comprehensive dashboard metrics.

**Endpoint:** `GET /analytics/dashboard`

**Query Parameters:**
- `organizationId`: Organization ID (required)
- `startDate`: Start date (ISO 8601)
- `endDate`: End date (ISO 8601)
- `granularity`: Granularity (hourly, daily, weekly, monthly)

**Response (200):**
```json
{
  "period": {
    "start": "2024-05-16T00:00:00Z",
    "end": "2024-05-23T00:00:00Z"
  },
  "metrics": {
    "totalWorkflows": 487,
    "successRate": 0.94,
    "averageDuration": 3240,
    "totalAgentTasks": 2341,
    "agentAccuracy": 0.96,
    "agentUtilization": 0.87,
    "complianceScore": 0.99,
    "costPerWorkflow": 2.34
  }
}
```

## Error Handling

All errors return appropriate HTTP status codes with detailed error messages.

**Error Response Format:**
```json
{
  "error": "validation_error",
  "message": "Invalid workflow definition",
  "details": {
    "field": "steps",
    "reason": "Steps array cannot be empty"
  },
  "requestId": "req-123456",
  "timestamp": "2024-05-23T10:35:00Z"
}
```

**Common Status Codes:**
- `200 OK` - Success
- `201 Created` - Resource created
- `202 Accepted` - Request accepted for processing
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Request conflicts with current state
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error
- `503 Service Unavailable` - Service temporarily unavailable

## Rate Limiting

API requests are rate limited per organization:
- **Standard tier**: 1,000 requests/minute
- **Professional tier**: 5,000 requests/minute
- **Enterprise tier**: Unlimited

Rate limit information is included in response headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 998
X-RateLimit-Reset: 1716467700
```

## Pagination

List endpoints support pagination via query parameters:
- `limit`: Number of results (default: 20, max: 100)
- `offset`: Pagination offset (default: 0)

Response includes pagination metadata:
```json
{
  "items": [...],
  "total": 500,
  "limit": 20,
  "offset": 0,
  "hasMore": true
}
```

---

For more information, visit [docs.serviceos.com](https://docs.serviceos.com)
