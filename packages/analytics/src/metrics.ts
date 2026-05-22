import { WorkflowMetrics } from '@serviceos/types';
import { AnalyticsRepository } from '@serviceos/database';
import { Logger } from '@serviceos/shared';

const logger = new Logger('MetricsCollector');

export class MetricsCollector {
  private repository: AnalyticsRepository;
  private metrics: Map<string, any>;

  constructor(repository: AnalyticsRepository) {
    this.repository = repository;
    this.metrics = new Map();
  }

  async trackWorkflowExecution(
    workflowId: string,
    executionId: string,
    duration: number,
    success: boolean,
    cost?: number
  ): Promise<void> {
    logger.debug(`Tracking workflow execution`, {
      workflowId,
      executionId,
      duration,
      success,
    });

    await this.repository.logEvent('default', {
      type: 'workflow_execution',
      entityType: 'workflow',
      entityId: workflowId,
      metrics: {
        executionId,
        success,
        cost,
      },
      durationMs: duration,
      success,
    });
  }

  async trackAgentExecution(
    agentId: string,
    executionId: string,
    duration: number,
    tokensUsed: { input: number; output: number },
    success: boolean
  ): Promise<void> {
    logger.debug(`Tracking agent execution`, {
      agentId,
      executionId,
      duration,
      success,
    });

    await this.repository.logEvent('default', {
      type: 'agent_execution',
      entityType: 'agent',
      entityId: agentId,
      metrics: {
        executionId,
        tokensInput: tokensUsed.input,
        tokensOutput: tokensUsed.output,
      },
      durationMs: duration,
      success,
    });
  }

  async trackApprovalMetric(
    approvalId: string,
    timeToApproval: number,
    approved: boolean
  ): Promise<void> {
    logger.debug(`Tracking approval metric`, {
      approvalId,
      timeToApproval,
      approved,
    });

    await this.repository.logEvent('default', {
      type: 'approval_decision',
      entityType: 'approval',
      entityId: approvalId,
      metrics: {
        approved,
      },
      durationMs: timeToApproval,
      success: true,
    });
  }

  async trackDocumentProcessing(
    documentId: string,
    duration: number,
    success: boolean,
    extractedFields?: number
  ): Promise<void> {
    logger.debug(`Tracking document processing`, {
      documentId,
      duration,
      success,
      extractedFields,
    });

    await this.repository.logEvent('default', {
      type: 'document_processing',
      entityType: 'document',
      entityId: documentId,
      metrics: {
        extractedFields: extractedFields || 0,
      },
      durationMs: duration,
      success,
    });
  }

  async getMetricsSummary(
    organizationId: string,
    period: { start: Date; end: Date }
  ): Promise<{
    totalExecutions: number;
    successRate: number;
    averageDuration: number;
    totalCost: number;
  }> {
    const metrics = await this.repository.getMetrics(
      organizationId,
      'workflow_execution'
    );

    return {
      totalExecutions: metrics.total || 0,
      successRate: metrics.total > 0 ? (metrics.successful / metrics.total) * 100 : 0,
      averageDuration: metrics.avg_duration || 0,
      totalCost: 0, // In production, sum from metrics
    };
  }
}
