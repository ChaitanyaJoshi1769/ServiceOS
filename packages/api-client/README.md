# ServiceOS API Client

Official TypeScript/JavaScript client library for ServiceOS API.

## Installation

```bash
npm install @serviceos/api-client
```

## Usage

```typescript
import { ServiceOSClient } from '@serviceos/api-client';

const client = new ServiceOSClient({
  apiKey: 'your-api-key',
  baseURL: 'https://api.serviceos.com/v1'
});

// Create and execute workflow
const workflow = await client.createWorkflow({
  name: 'My Workflow',
  steps: [...]
});

const execution = await client.executeWorkflow(workflow.id, {
  data: 'input-data'
});

const status = await client.getExecution(execution.executionId);
```

## Examples

### Execute a Workflow

```typescript
const execution = await client.executeWorkflow('wf-123', {
  document: 'base64-encoded-data'
});

// Monitor execution
const checkStatus = setInterval(async () => {
  const status = await client.getExecution(execution.executionId);
  console.log(`Status: ${status.status}`);
  
  if (status.status === 'completed') {
    clearInterval(checkStatus);
    console.log('Done!', status.output);
  }
}, 1000);
```

### Request Approval

```typescript
const approval = await client.createApproval({
  title: 'Policy Review',
  description: 'Review policy renewal',
  assignees: ['manager@company.com'],
  dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000)
});

// Submit decision
await client.submitDecision(approval.approvalId, {
  decision: 'approved',
  comment: 'Looks good'
});
```

### Upload and Extract

```typescript
const doc = await client.uploadDocument(
  fileBuffer,
  { documentType: 'policy' }
);

const extracted = await client.extractFromDocument(doc.documentId, [
  'policyNumber',
  'effectiveDate'
]);
```

## API Reference

See [API_REFERENCE.md](../../API_REFERENCE.md) for complete API documentation.
