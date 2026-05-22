export const SCHEMAS = {
  organizations: `
    CREATE TABLE IF NOT EXISTS organizations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      description TEXT,
      tier VARCHAR(50) DEFAULT 'startup',
      status VARCHAR(50) DEFAULT 'active',
      settings JSONB DEFAULT '{}',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    CREATE INDEX idx_organizations_slug ON organizations(slug);
    CREATE INDEX idx_organizations_status ON organizations(status);
  `,

  users: `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      email VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'viewer',
      status VARCHAR(50) DEFAULT 'active',
      password_hash VARCHAR(255),
      last_login TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(organization_id, email)
    );
    CREATE INDEX idx_users_organization ON users(organization_id);
    CREATE INDEX idx_users_email ON users(email);
  `,

  workflows: `
    CREATE TABLE IF NOT EXISTS workflows (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      version INTEGER DEFAULT 1,
      status VARCHAR(50) DEFAULT 'draft',
      definition JSONB NOT NULL,
      domain VARCHAR(50),
      tags TEXT[] DEFAULT '{}',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    CREATE INDEX idx_workflows_org ON workflows(organization_id);
    CREATE INDEX idx_workflows_status ON workflows(status);
    CREATE INDEX idx_workflows_domain ON workflows(domain);
  `,

  workflow_executions: `
    CREATE TABLE IF NOT EXISTS workflow_executions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      workflow_id UUID NOT NULL REFERENCES workflows(id),
      workflow_version INTEGER NOT NULL,
      status VARCHAR(50) DEFAULT 'pending',
      context JSONB DEFAULT '{}',
      current_step_id VARCHAR(255),
      output JSONB,
      errors JSONB[] DEFAULT '{}',
      started_at TIMESTAMP,
      completed_at TIMESTAMP,
      created_by VARCHAR(255),
      triggered_by JSONB,
      duration_ms INTEGER,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE INDEX idx_executions_org ON workflow_executions(organization_id);
    CREATE INDEX idx_executions_workflow ON workflow_executions(workflow_id);
    CREATE INDEX idx_executions_status ON workflow_executions(status);
    CREATE INDEX idx_executions_created ON workflow_executions(created_at);
  `,

  agents: `
    CREATE TABLE IF NOT EXISTS agents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      role VARCHAR(255) NOT NULL,
      capabilities TEXT[] DEFAULT '{}',
      tools TEXT[] DEFAULT '{}',
      status VARCHAR(50) DEFAULT 'active',
      version INTEGER DEFAULT 1,
      config JSONB DEFAULT '{}',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    CREATE INDEX idx_agents_org ON agents(organization_id);
    CREATE INDEX idx_agents_role ON agents(role);
    CREATE INDEX idx_agents_status ON agents(status);
  `,

  agent_executions: `
    CREATE TABLE IF NOT EXISTS agent_executions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      agent_id UUID NOT NULL REFERENCES agents(id),
      workflow_execution_id UUID REFERENCES workflow_executions(id),
      status VARCHAR(50) DEFAULT 'assigned',
      instruction TEXT NOT NULL,
      reasoning TEXT,
      tool_calls JSONB[] DEFAULT '{}',
      output JSONB,
      tokens_input INTEGER DEFAULT 0,
      tokens_output INTEGER DEFAULT 0,
      cost_usd DECIMAL(10, 6),
      started_at TIMESTAMP,
      completed_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE INDEX idx_agent_exec_org ON agent_executions(organization_id);
    CREATE INDEX idx_agent_exec_agent ON agent_executions(agent_id);
    CREATE INDEX idx_agent_exec_status ON agent_executions(status);
  `,

  documents: `
    CREATE TABLE IF NOT EXISTS documents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      workflow_execution_id UUID REFERENCES workflow_executions(id),
      filename VARCHAR(512) NOT NULL,
      mime_type VARCHAR(100),
      size INTEGER,
      url TEXT NOT NULL,
      storage_path VARCHAR(512),
      document_type VARCHAR(100),
      classification JSONB DEFAULT '{}',
      extracted_data JSONB,
      processing_status VARCHAR(50) DEFAULT 'pending',
      processing_errors TEXT[] DEFAULT '{}',
      uploaded_at TIMESTAMP DEFAULT NOW(),
      processed_at TIMESTAMP,
      expires_at TIMESTAMP,
      tags TEXT[] DEFAULT '{}',
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE INDEX idx_documents_org ON documents(organization_id);
    CREATE INDEX idx_documents_workflow ON documents(workflow_execution_id);
    CREATE INDEX idx_documents_status ON documents(processing_status);
    CREATE INDEX idx_documents_type ON documents(document_type);
  `,

  approvals: `
    CREATE TABLE IF NOT EXISTS approvals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      workflow_execution_id UUID NOT NULL REFERENCES workflow_executions(id),
      step_id VARCHAR(255) NOT NULL,
      status VARCHAR(50) DEFAULT 'pending',
      policy_id VARCHAR(255),
      approvers TEXT[] NOT NULL,
      requested_at TIMESTAMP DEFAULT NOW(),
      expires_at TIMESTAMP NOT NULL,
      rejection_reason TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE INDEX idx_approvals_org ON approvals(organization_id);
    CREATE INDEX idx_approvals_workflow ON approvals(workflow_execution_id);
    CREATE INDEX idx_approvals_status ON approvals(status);
  `,

  approval_records: `
    CREATE TABLE IF NOT EXISTS approval_records (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      approval_id UUID NOT NULL REFERENCES approvals(id),
      approver_id VARCHAR(255) NOT NULL,
      status VARCHAR(50) NOT NULL,
      comment TEXT,
      decided_at TIMESTAMP DEFAULT NOW(),
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE INDEX idx_approval_records_approval ON approval_records(approval_id);
  `,

  audit_events: `
    CREATE TABLE IF NOT EXISTS audit_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      timestamp TIMESTAMP DEFAULT NOW(),
      user_id VARCHAR(255),
      agent_id VARCHAR(255),
      system_initiated BOOLEAN DEFAULT FALSE,
      action VARCHAR(255) NOT NULL,
      resource_type VARCHAR(100) NOT NULL,
      resource_id VARCHAR(255) NOT NULL,
      before_state JSONB,
      after_state JSONB,
      context JSONB,
      compliance_framework VARCHAR(100),
      risk_level VARCHAR(50) DEFAULT 'low',
      requires_review BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE INDEX idx_audit_org ON audit_events(organization_id);
    CREATE INDEX idx_audit_action ON audit_events(action);
    CREATE INDEX idx_audit_resource ON audit_events(resource_type, resource_id);
    CREATE INDEX idx_audit_timestamp ON audit_events(timestamp);
  `,

  compliance_policies: `
    CREATE TABLE IF NOT EXISTS compliance_policies (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      framework VARCHAR(100) NOT NULL,
      description TEXT,
      rules JSONB DEFAULT '{}',
      controls JSONB DEFAULT '{}',
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    CREATE INDEX idx_policies_org ON compliance_policies(organization_id);
    CREATE INDEX idx_policies_framework ON compliance_policies(framework);
  `,

  compliance_records: `
    CREATE TABLE IF NOT EXISTS compliance_records (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      policy_id UUID NOT NULL REFERENCES compliance_policies(id),
      status VARCHAR(50) NOT NULL,
      evidence_documents JSONB[] DEFAULT '{}',
      tested_at TIMESTAMP NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      remediation JSONB,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE INDEX idx_compliance_org ON compliance_records(organization_id);
    CREATE INDEX idx_compliance_policy ON compliance_records(policy_id);
    CREATE INDEX idx_compliance_expires ON compliance_records(expires_at);
  `,

  notifications: `
    CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      user_id VARCHAR(255) NOT NULL,
      type VARCHAR(100) NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      data JSONB DEFAULT '{}',
      read BOOLEAN DEFAULT FALSE,
      channels TEXT[] DEFAULT '{}',
      created_at TIMESTAMP DEFAULT NOW(),
      read_at TIMESTAMP
    );
    CREATE INDEX idx_notifications_user ON notifications(user_id, read);
    CREATE INDEX idx_notifications_created ON notifications(created_at);
  `,

  analytics_events: `
    CREATE TABLE IF NOT EXISTS analytics_events (
      id BIGSERIAL PRIMARY KEY,
      organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      event_type VARCHAR(100) NOT NULL,
      entity_type VARCHAR(100),
      entity_id VARCHAR(255),
      metrics JSONB DEFAULT '{}',
      duration_ms INTEGER,
      success BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE INDEX idx_analytics_org ON analytics_events(organization_id);
    CREATE INDEX idx_analytics_type ON analytics_events(event_type);
    CREATE INDEX idx_analytics_timestamp ON analytics_events(created_at);
  `,
};
