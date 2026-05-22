import { Database } from './connection';
import { WorkflowExecution, AuditEvent, ApprovalRequest } from '@serviceos/types';

export class WorkflowExecutionRepository {
  constructor(private db: Database) {}

  async create(execution: Partial<WorkflowExecution>): Promise<WorkflowExecution> {
    const result = await this.db.query(
      `INSERT INTO workflow_executions
       (organization_id, workflow_id, workflow_version, status, context, created_by, triggered_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        execution.organizationId,
        execution.workflowId,
        execution.workflowVersion,
        execution.status,
        JSON.stringify(execution.context),
        execution.createdBy,
        JSON.stringify(execution.triggeredBy),
      ]
    );
    return result.rows[0];
  }

  async findById(id: string): Promise<WorkflowExecution | null> {
    const result = await this.db.query(
      'SELECT * FROM workflow_executions WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async findByOrganization(
    organizationId: string,
    limit = 10,
    offset = 0
  ): Promise<WorkflowExecution[]> {
    const result = await this.db.query(
      `SELECT * FROM workflow_executions
       WHERE organization_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [organizationId, limit, offset]
    );
    return result.rows;
  }

  async update(id: string, updates: Partial<WorkflowExecution>): Promise<void> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updates.status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(updates.status);
    }
    if (updates.output !== undefined) {
      fields.push(`output = $${paramCount++}`);
      values.push(JSON.stringify(updates.output));
    }
    if (updates.completedAt !== undefined) {
      fields.push(`completed_at = $${paramCount++}`);
      values.push(updates.completedAt);
    }

    if (fields.length === 0) return;

    fields.push(`updated_at = NOW()`);
    values.push(id);

    await this.db.query(
      `UPDATE workflow_executions SET ${fields.join(', ')} WHERE id = $${paramCount}`,
      values
    );
  }
}

export class AuditEventRepository {
  constructor(private db: Database) {}

  async log(event: AuditEvent): Promise<void> {
    await this.db.query(
      `INSERT INTO audit_events
       (organization_id, timestamp, user_id, agent_id, system_initiated, action, resource_type, resource_id, before_state, after_state, context, compliance_framework, risk_level, requires_review)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        event.organizationId,
        event.timestamp,
        event.userId,
        event.agentId,
        event.systemInitiated,
        event.action,
        event.resourceType,
        event.resourceId,
        JSON.stringify(event.before),
        JSON.stringify(event.after),
        JSON.stringify(event.context),
        event.complianceFramework,
        event.riskLevel,
        event.requiresReview,
      ]
    );
  }

  async findByOrganization(
    organizationId: string,
    filters?: {
      action?: string;
      startDate?: Date;
      endDate?: Date;
    },
    limit = 100,
    offset = 0
  ): Promise<AuditEvent[]> {
    let query = 'SELECT * FROM audit_events WHERE organization_id = $1';
    const values: unknown[] = [organizationId];
    let paramCount = 2;

    if (filters?.action) {
      query += ` AND action = $${paramCount++}`;
      values.push(filters.action);
    }
    if (filters?.startDate) {
      query += ` AND timestamp >= $${paramCount++}`;
      values.push(filters.startDate);
    }
    if (filters?.endDate) {
      query += ` AND timestamp <= $${paramCount++}`;
      values.push(filters.endDate);
    }

    query += ` ORDER BY timestamp DESC LIMIT $${paramCount++} OFFSET $${paramCount}`;
    values.push(limit, offset);

    const result = await this.db.query(query, values);
    return result.rows;
  }
}

export class ApprovalRepository {
  constructor(private db: Database) {}

  async create(approval: Partial<ApprovalRequest>): Promise<ApprovalRequest> {
    const result = await this.db.query(
      `INSERT INTO approvals
       (organization_id, workflow_execution_id, step_id, policy_id, approvers, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        approval.organizationId,
        approval.workflowExecutionId,
        approval.stepId,
        approval.policy?.id,
        JSON.stringify(approval.policy?.approvers || []),
        approval.expiresAt,
      ]
    );
    return result.rows[0];
  }

  async findById(id: string): Promise<ApprovalRequest | null> {
    const result = await this.db.query(
      'SELECT * FROM approvals WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async findPending(organizationId: string): Promise<ApprovalRequest[]> {
    const result = await this.db.query(
      `SELECT * FROM approvals WHERE organization_id = $1 AND status = 'pending'
       ORDER BY expires_at ASC`,
      [organizationId]
    );
    return result.rows;
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await this.db.query(
      'UPDATE approvals SET status = $1 WHERE id = $2',
      [status, id]
    );
  }
}

export class DocumentRepository {
  constructor(private db: Database) {}

  async create(doc: any): Promise<any> {
    const result = await this.db.query(
      `INSERT INTO documents
       (organization_id, workflow_execution_id, filename, mime_type, size, url, storage_path, document_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        doc.organizationId,
        doc.workflowExecutionId,
        doc.filename,
        doc.mimeType,
        doc.size,
        doc.url,
        doc.storagePath,
        doc.documentType,
      ]
    );
    return result.rows[0];
  }

  async findById(id: string): Promise<any> {
    const result = await this.db.query(
      'SELECT * FROM documents WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async findByWorkflowExecution(executionId: string): Promise<any[]> {
    const result = await this.db.query(
      'SELECT * FROM documents WHERE workflow_execution_id = $1 ORDER BY created_at DESC',
      [executionId]
    );
    return result.rows;
  }

  async updateProcessingStatus(id: string, status: string, data?: any): Promise<void> {
    await this.db.query(
      `UPDATE documents
       SET processing_status = $1, processed_at = NOW(), extracted_data = $2
       WHERE id = $3`,
      [status, JSON.stringify(data), id]
    );
  }
}

export class AnalyticsRepository {
  constructor(private db: Database) {}

  async logEvent(organizationId: string, event: any): Promise<void> {
    await this.db.query(
      `INSERT INTO analytics_events
       (organization_id, event_type, entity_type, entity_id, metrics, duration_ms, success)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        organizationId,
        event.type,
        event.entityType,
        event.entityId,
        JSON.stringify(event.metrics),
        event.durationMs,
        event.success !== false,
      ]
    );
  }

  async getMetrics(
    organizationId: string,
    eventType: string,
    hours = 24
  ): Promise<any> {
    const result = await this.db.query(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful,
        AVG(duration_ms) as avg_duration,
        MAX(duration_ms) as max_duration,
        MIN(duration_ms) as min_duration
       FROM analytics_events
       WHERE organization_id = $1 AND event_type = $2 AND created_at > NOW() - INTERVAL '1 hour' * $3`,
      [organizationId, eventType, hours]
    );
    return result.rows[0];
  }
}
