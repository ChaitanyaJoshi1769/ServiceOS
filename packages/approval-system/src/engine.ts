import {
  ApprovalRequest,
  ApprovalPolicy,
  ApprovalRecord,
  WorkflowExecution,
} from '@serviceos/types';
import { ApprovalRepository } from '@serviceos/database';
import { Logger } from '@serviceos/shared';

const logger = new Logger('ApprovalEngine');

export class ApprovalEngine {
  private repository: ApprovalRepository;

  constructor(repository: ApprovalRepository) {
    this.repository = repository;
  }

  async requestApproval(
    organizationId: string,
    execution: WorkflowExecution,
    policy: ApprovalPolicy
  ): Promise<ApprovalRequest> {
    logger.info(`Creating approval request for workflow ${execution.id}`);

    const request: Partial<ApprovalRequest> = {
      organizationId,
      workflowExecutionId: execution.id,
      stepId: execution.currentStepId,
      policy,
      status: 'pending',
      requestedAt: new Date(),
      expiresAt: new Date(Date.now() + policy.timeout),
      approvals: [],
    };

    const created = await this.repository.create(request);
    return created;
  }

  async approve(
    approvalId: string,
    approverId: string,
    comment?: string
  ): Promise<boolean> {
    const approval = await this.repository.findById(approvalId);
    if (!approval || approval.status !== 'pending') {
      return false;
    }

    const record: ApprovalRecord = {
      id: `approval_${Date.now()}`,
      approvalRequestId: approvalId,
      approverId,
      status: 'approved',
      comment,
      decidedAt: new Date(),
    };

    approval.approvals.push(record);

    const requiredApprovals = approval.policy.approvers.reduce((min, role) => {
      return Math.min(min, role.minApprovals);
    }, Infinity);

    const approvalCount = approval.approvals.filter((a) => a.status === 'approved').length;

    if (approvalCount >= requiredApprovals) {
      await this.repository.updateStatus(approvalId, 'approved');
      logger.info(`Approval ${approvalId} approved`);
      return true;
    }

    return false;
  }

  async reject(
    approvalId: string,
    approverId: string,
    reason: string
  ): Promise<void> {
    const approval = await this.repository.findById(approvalId);
    if (!approval) {
      return;
    }

    const record: ApprovalRecord = {
      id: `approval_${Date.now()}`,
      approvalRequestId: approvalId,
      approverId,
      status: 'rejected',
      comment: reason,
      decidedAt: new Date(),
    };

    approval.approvals.push(record);
    approval.rejectionReason = reason;

    await this.repository.updateStatus(approvalId, 'rejected');
    logger.info(`Approval ${approvalId} rejected`);
  }

  async checkExpired(): Promise<void> {
    const now = new Date();
    const pending = await this.repository.findPending(''); // Get all pending

    for (const approval of pending) {
      if (approval.expiresAt < now) {
        await this.repository.updateStatus(approval.id, 'expired');
        logger.warn(`Approval ${approval.id} expired`);
      }
    }
  }

  async getApprovalStatus(approvalId: string): Promise<{
    status: string;
    progress: number;
    remainingApprovals: number;
  }> {
    const approval = await this.repository.findById(approvalId);
    if (!approval) {
      return { status: 'not_found', progress: 0, remainingApprovals: 0 };
    }

    const totalRequired = approval.policy.approvers.reduce((sum, role) => {
      return sum + role.minApprovals;
    }, 0);

    const approved = approval.approvals.filter((a) => a.status === 'approved').length;
    const progress = (approved / totalRequired) * 100;

    return {
      status: approval.status,
      progress,
      remainingApprovals: Math.max(0, totalRequired - approved),
    };
  }
}
