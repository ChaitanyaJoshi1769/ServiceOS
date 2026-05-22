# ServiceOS Quick Start Guide

Get up and running with ServiceOS in minutes.

## 5-Minute Setup

### 1. Local Development (Docker)

```bash
# Clone and start
git clone https://github.com/ChaitanyaJoshi1769/ServiceOS.git
cd ServiceOS
docker-compose up -d

# Access services
open http://localhost:3001  # Web UI
# API: http://localhost:3000
```

### 2. Create Your First Workflow

```bash
# Via API
curl -X POST http://localhost:3000/api/workflows \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My First Workflow",
    "steps": [
      {
        "id": "step1",
        "type": "agent",
        "agent": "policydocumentprocessor",
        "input": { "document": "policy.pdf" }
      },
      {
        "id": "step2",
        "type": "approval",
        "assignee": "manager@company.com"
      }
    ]
  }'
```

### 3. Execute Workflow

```bash
# Start execution
curl -X POST http://localhost:3000/api/workflows/{workflowId}/execute

# Check status
curl http://localhost:3000/api/workflows/executions/{executionId}
```

## Common Use Cases

### Insurance Policy Onboarding

```typescript
import { PolicyOnboarding } from '@serviceos/domains-insurance';
import { WorkflowEngine } from '@serviceos/workflow-engine';

const onboarding = new PolicyOnboarding();
const workflow = new WorkflowEngine();

// Execute policy onboarding workflow
const execution = await workflow.execute({
  name: 'Policy Onboarding',
  steps: [
    {
      type: 'agent',
      action: 'validatePolicy',
      input: { policyDocument: '/path/to/policy.pdf' }
    },
    {
      type: 'agent',
      action: 'performKYC',
      input: { customerInfo: customerData }
    },
    {
      type: 'approval',
      assignee: 'underwriter@insurance.com',
      timeout: 24 * 60 * 60 * 1000 // 24 hours
    },
    {
      type: 'agent',
      action: 'issuePolicy'
    }
  ]
});

// Monitor progress
workflow.on('stepCompleted', (step) => {
  console.log(`Step ${step.name} completed in ${step.duration}ms`);
});
```

### Tax Return Processing

```typescript
import { TaxFilingEngine, TaxCalculator } from '@serviceos/domains-tax';
import { ConversationTracker } from '@serviceos/customer-interactions';

const filingEngine = new TaxFilingEngine();
const calculator = new TaxCalculator();
const tracker = new ConversationTracker();

// Start conversation with taxpayer
const conversation = await tracker.createConversation(
  'customer123',
  'email',
  'tax-agent-001'
);

// Collect tax information via conversation
await tracker.addMessage(
  conversation.id,
  'tax-agent-001',
  'Hello! I\'m ready to help prepare your tax return. Can you provide your W-2 documents?'
);

// Process return
const return = await filingEngine.prepareReturn({
  taxpayerId: 'customer123',
  taxYear: 2023,
  filingStatus: 'single',
  documents: [...]
});

// Calculate taxes
const calculation = await calculator.calculateFederal({
  income: return.totalIncome,
  deductions: return.deductions,
  credits: return.credits,
  filingStatus: 'single'
});

// Request approval
const approval = await approvalEngine.createApprovalRequest({
  workflowId: return.id,
  title: 'Tax Return Review',
  description: `Review and approve tax return for ${taxpayerId}`,
  assignees: ['tax-reviewer@company.com'],
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
});
```

### Healthcare Prior Authorization

```typescript
import { PriorAuthEngine } from '@serviceos/domains-healthcare';
import { EmailService } from '@serviceos/customer-interactions';

const priorAuth = new PriorAuthEngine();
const emailService = new EmailService();

// Submit prior authorization request
const request = await priorAuth.submitRequest({
  patientId: 'patient456',
  procedureCode: 'CPT-12345',
  procedureDescription: 'MRI of knee',
  providerNPI: '1234567890',
  insurancePlan: 'BCBS-001'
});

// Track status
const tracking = await priorAuth.trackRequest(request.id);
console.log(`Status: ${tracking.status}`);
console.log(`Estimated decision: ${tracking.estimatedDecisionDate}`);

// Send notification to provider
await emailService.sendEmail({
  to: 'provider@clinic.com',
  subject: `Prior Auth Request Submitted: ${request.id}`,
  body: `
    Your prior authorization request has been submitted.
    Reference Number: ${request.id}
    Estimated Decision: ${tracking.estimatedDecisionDate}
    Status: ${tracking.status}
  `
});
```

## Working with Workflows

### Define Workflow

```typescript
import { WorkflowDefinition } from '@serviceos/types';

const workflowDef: WorkflowDefinition = {
  id: 'claims_processing',
  name: 'Claims Processing',
  description: 'Process insurance claims end-to-end',
  version: '1.0.0',
  steps: [
    {
      id: 'validate_claim',
      type: 'action',
      action: 'validateClaim',
      input: { claimData: '$.claim' },
      onSuccess: 'extract_documents',
      onFailure: 'reject_claim'
    },
    {
      id: 'extract_documents',
      type: 'action',
      action: 'extractDocuments',
      input: { documents: '$.claim.attachments' },
      onSuccess: 'assess_claim'
    },
    {
      id: 'assess_claim',
      type: 'action',
      action: 'assessClaim',
      input: { claim: '$.claim' },
      onSuccess: 'approval_check'
    },
    {
      id: 'approval_check',
      type: 'branch',
      condition: 'amount > 5000',
      branches: {
        true: 'require_approval',
        false: 'auto_approve'
      }
    },
    {
      id: 'require_approval',
      type: 'approval',
      assignees: ['claims-manager@company.com'],
      timeout: 48 * 60 * 60 * 1000,
      onApproved: 'process_payout',
      onRejected: 'deny_claim'
    },
    {
      id: 'auto_approve',
      type: 'action',
      action: 'approveClaim',
      onSuccess: 'process_payout'
    },
    {
      id: 'process_payout',
      type: 'action',
      action: 'processPayout',
      input: { claim: '$.claim' },
      onSuccess: 'notify_success'
    },
    {
      id: 'notify_success',
      type: 'action',
      action: 'notifyClaimant',
      input: { message: 'Claim approved and payment processed' }
    },
    {
      id: 'reject_claim',
      type: 'action',
      action: 'rejectClaim',
      input: { reason: '$.validationError' }
    },
    {
      id: 'deny_claim',
      type: 'action',
      action: 'denyClaim',
      input: { reason: 'Requires additional review' }
    }
  ]
};
```

### Execute Workflow

```typescript
import { WorkflowEngine } from '@serviceos/workflow-engine';

const engine = new WorkflowEngine();

// Execute workflow
const execution = await engine.execute({
  definition: workflowDef,
  input: {
    claim: {
      id: 'CLM-001',
      amount: 7500,
      claimType: 'medical',
      attachments: [...]
    }
  },
  organizationId: 'org-123'
});

// Monitor execution
execution.on('stepStarted', (step) => {
  console.log(`Started: ${step.id}`);
});

execution.on('stepCompleted', (step) => {
  console.log(`Completed: ${step.id} in ${step.duration}ms`);
});

execution.on('stepFailed', (step, error) => {
  console.error(`Failed: ${step.id}`, error);
});

execution.on('complete', (result) => {
  console.log('Workflow completed successfully');
  console.log('Final state:', result.state);
});

// Wait for completion
const result = await execution.wait();
console.log('Claim ID:', result.output.claimId);
```

## Working with Agents

### Create Agent

```typescript
import { Agent, ToolRegistry } from '@serviceos/agent-core';

const toolRegistry = new ToolRegistry();

// Register custom tool
toolRegistry.register({
  name: 'validatePolicy',
  description: 'Validate insurance policy document',
  parameters: {
    type: 'object',
    properties: {
      policyDocument: { type: 'string', description: 'Path to policy PDF' },
      validationType: { type: 'string', enum: ['format', 'content', 'full'] }
    }
  },
  execute: async (params) => {
    // Validation logic
    return { valid: true, errors: [] };
  }
});

// Create agent
const agent = new Agent({
  name: 'PolicyValidationAgent',
  description: 'Validates insurance policies for compliance',
  systemPrompt: `You are an insurance policy validation specialist. 
                 Your role is to review and validate insurance policies.`,
  tools: toolRegistry,
  model: 'claude-3-opus',
  maxTokens: 4096
});

// Execute agent task
const result = await agent.execute({
  task: 'Validate the attached policy document for standard insurance clauses and compliance',
  documents: [policyBuffer]
});

console.log('Validation result:', result);
```

## Working with Approvals

```typescript
import { ApprovalEngine } from '@serviceos/approval-system';
import { ApprovalNotifier } from '@serviceos/approval-system';

const approvalEngine = new ApprovalEngine();
const notifier = new ApprovalNotifier();

// Create approval request
const approval = await approvalEngine.create({
  workflowId: 'wf-123',
  title: 'Policy Renewal Approval',
  description: 'Review and approve policy renewal for customer XYZ',
  assignees: ['manager1@company.com', 'manager2@company.com'],
  dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
  priority: 'high',
  metadata: {
    customerId: 'cust-123',
    policyId: 'pol-456'
  }
});

// Send notifications
await notifier.notify(approval.id, {
  channels: ['email', 'slack'],
  template: 'approval_request',
  subject: 'Policy Renewal Approval Required'
});

// Monitor approval
const checkApproval = async () => {
  const status = await approvalEngine.getStatus(approval.id);
  
  if (status.approved) {
    console.log(`Approved by: ${status.approvedBy}`);
    console.log(`Approval date: ${status.approvedAt}`);
    return true;
  } else if (status.rejected) {
    console.log(`Rejected by: ${status.rejectedBy}`);
    console.log(`Rejection reason: ${status.rejectionReason}`);
    return false;
  } else {
    console.log(`Still pending. Approvers: ${status.pendingApprovers.join(', ')}`);
    return null;
  }
};

// Check status (poll or use webhooks)
setInterval(checkApproval, 60 * 1000); // Check every minute
```

## Monitoring and Analytics

```typescript
import { DashboardService } from '@serviceos/analytics';

const dashboard = new DashboardService();

// Get operations dashboard
const operationsDashboard = await dashboard.getOperationsDashboard({
  organizationId: 'org-123',
  dateRange: {
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
    end: new Date()
  }
});

console.log('Operations Summary:');
console.log(`Success Rate: ${operationsDashboard.successRate}%`);
console.log(`Avg Duration: ${operationsDashboard.avgDuration}ms`);
console.log(`Total Workflows: ${operationsDashboard.totalWorkflows}`);

// Get workflow analytics
const workflowAnalytics = await dashboard.getWorkflowAnalytics('policy_onboarding');
console.log(`Policy Onboarding Metrics:`);
console.log(`Success Rate: ${workflowAnalytics.successRate}%`);
console.log(`Average Duration: ${workflowAnalytics.avgDuration}ms`);
console.log(`Total Executions: ${workflowAnalytics.totalExecutions}`);

// Get compliance metrics
const complianceMetrics = await dashboard.getComplianceMetrics('org-123');
console.log('Compliance Status:');
console.log(`HIPAA Compliant: ${complianceMetrics.hipaa}`);
console.log(`GDPR Compliant: ${complianceMetrics.gdpr}`);
console.log(`SOC2 Compliant: ${complianceMetrics.soc2}`);
console.log(`Audit Trail Coverage: 100%`);
```

## Next Steps

1. **Read ARCHITECTURE.md** - Understand the system design
2. **Follow DEPLOYMENT_GUIDE.md** - Deploy to your environment
3. **Review CONTRIBUTING.md** - Create custom domain modules
4. **Explore examples/** - See more use cases
5. **Join community** - Connect with other users

## Resources

- **Documentation**: https://docs.serviceos.com
- **API Reference**: https://api.serviceos.com/docs
- **Examples**: https://github.com/ChaitanyaJoshi1769/ServiceOS/tree/main/examples
- **Community**: https://community.serviceos.com
- **Support**: support@serviceos.com

---

Happy automating! 🚀
