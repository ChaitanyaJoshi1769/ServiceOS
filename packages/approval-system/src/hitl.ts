import {
  WorkflowExecution,
  StepExecution,
} from '@serviceos/types';
import { Logger } from '@serviceos/shared';

const logger = new Logger('HumanInTheLoop');

export class HumanInTheLoop {
  async pauseForReview(
    execution: WorkflowExecution,
    step: StepExecution,
    reason: string
  ): Promise<void> {
    logger.info(
      `Pausing workflow ${execution.id} at step ${step.id} for human review: ${reason}`
    );

    execution.status = 'paused';
    step.status = 'pending';

    // Store pause reason for the human reviewer
    (step as any).pauseReason = reason;
    (step as any).pausedAt = new Date();
  }

  async requestManualIntervention(
    executionId: string,
    stepId: string,
    instruction: string,
    options?: {
      timeout?: number;
      priority?: 'low' | 'medium' | 'high' | 'critical';
      assignee?: string;
    }
  ): Promise<void> {
    logger.info(
      `Requesting manual intervention for workflow ${executionId} at step ${stepId}`
    );

    // Create a task for human operator
    const task = {
      id: `task_${Date.now()}`,
      type: 'manual_intervention',
      executionId,
      stepId,
      instruction,
      priority: options?.priority || 'medium',
      assignee: options?.assignee,
      createdAt: new Date(),
      timeout: options?.timeout || 3600000, // 1 hour default
    };

    logger.debug('Created manual intervention task', task);
  }

  async resumeExecution(
    execution: WorkflowExecution,
    step: StepExecution,
    result: Record<string, unknown>
  ): Promise<void> {
    logger.info(
      `Resuming workflow ${execution.id} from human intervention at step ${step.id}`
    );

    execution.status = 'running';
    step.status = 'completed';
    step.output = result;
    step.completedAt = new Date();

    // Mark as human-completed
    (step as any).humanCompleted = true;
    (step as any).completedBy = 'human';
  }

  async rejectStep(
    execution: WorkflowExecution,
    step: StepExecution,
    reason: string
  ): Promise<void> {
    logger.warn(
      `Human rejected step ${step.id} in workflow ${execution.id}: ${reason}`
    );

    execution.status = 'failed';
    step.status = 'failed';
    (step as any).humanRejected = true;
    (step as any).rejectionReason = reason;
  }

  async trackDecision(
    executionId: string,
    stepId: string,
    decision: 'approve' | 'reject' | 'modify',
    metadata?: Record<string, unknown>
  ): Promise<void> {
    logger.info(
      `Tracking human decision for workflow ${executionId} at step ${stepId}: ${decision}`
    );

    // Log decision for audit trail and learning
    const decisionLog = {
      executionId,
      stepId,
      decision,
      timestamp: new Date(),
      metadata,
    };

    logger.debug('Human decision logged', decisionLog);
  }
}
