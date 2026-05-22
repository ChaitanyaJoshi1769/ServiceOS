import { WorkflowExecution, ErrorPolicy, ExecutionError } from '@serviceos/types';

export interface RetryPolicy {
  maxRetries: number;
  backoffMultiplier: number;
}

export class ErrorHandler {
  private retryPolicy: RetryPolicy;

  constructor(retryPolicy: RetryPolicy) {
    this.retryPolicy = retryPolicy;
  }

  async handleError(
    error: unknown,
    policy: ErrorPolicy,
    execution: WorkflowExecution
  ): Promise<boolean> {
    const message = error instanceof Error ? error.message : String(error);

    // Record error in execution
    if (!execution.errors) {
      execution.errors = [];
    }

    execution.errors.push({
      stepId: execution.currentStepId || 'unknown',
      timestamp: new Date(),
      code: error instanceof Error ? error.constructor.name : 'UNKNOWN_ERROR',
      message,
    });

    switch (policy.strategy) {
      case 'retry':
        return true; // Caller will retry

      case 'fallback':
        if (policy.fallbackStep) {
          // Skip to fallback step
          return false;
        }
        return false;

      case 'escalate':
        if (policy.escalationPath && policy.escalationPath.length > 0) {
          // Trigger escalation workflow
          return false;
        }
        return false;

      case 'skip':
        return false; // Continue to next step

      case 'terminate':
      default:
        throw error; // Stop execution
    }
  }

  validateTimeout(
    startTime: Date,
    timeout: number
  ): boolean {
    const elapsed = Date.now() - startTime.getTime();
    return elapsed <= timeout;
  }

  getRetryDelay(attemptNumber: number): number {
    return (
      1000 *
      Math.pow(
        this.retryPolicy.backoffMultiplier,
        attemptNumber - 1
      )
    );
  }
}
