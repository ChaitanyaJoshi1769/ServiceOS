import {
  WorkflowDefinition,
  WorkflowExecution,
  WorkflowStep,
  StepExecution,
  AttemptRecord,
} from '@serviceos/types';
import { StateManager } from './state-manager';
import { ErrorHandler } from './error-handler';
import { EventEmitter } from './event-emitter';
import { BranchResolver } from './branch-resolver';

export interface WorkflowEngineConfig {
  defaultTimeout: number;
  retryPolicy: {
    maxRetries: number;
    backoffMultiplier: number;
  };
}

export class WorkflowExecutor {
  private stateManager: StateManager;
  private errorHandler: ErrorHandler;
  private eventEmitter: EventEmitter;
  private branchResolver: BranchResolver;
  private config: WorkflowEngineConfig;

  constructor(
    stateManager: StateManager,
    errorHandler: ErrorHandler,
    eventEmitter: EventEmitter,
    config: WorkflowEngineConfig
  ) {
    this.stateManager = stateManager;
    this.errorHandler = errorHandler;
    this.eventEmitter = eventEmitter;
    this.branchResolver = new BranchResolver();
    this.config = config;
  }

  async execute(
    definition: WorkflowDefinition,
    execution: WorkflowExecution
  ): Promise<void> {
    execution.status = 'running';
    execution.startedAt = new Date();

    try {
      await this.executeSteps(definition, execution);
    } catch (error) {
      throw error;
    }
  }

  private async executeSteps(
    definition: WorkflowDefinition,
    execution: WorkflowExecution
  ): Promise<void> {
    for (const step of definition.steps) {
      if (
        execution.status === 'paused' ||
        execution.status === 'cancelled'
      ) {
        break;
      }

      const stepExecution = execution.steps.find(
        (s) => s.stepId === step.id
      );
      if (!stepExecution) continue;

      execution.currentStepId = step.id;
      this.eventEmitter.emit('step.started', { stepId: step.id });

      try {
        stepExecution.status = 'running';
        stepExecution.startedAt = new Date();

        // Check if step should run based on conditions
        if (!this.shouldExecuteStep(step, execution)) {
          stepExecution.status = 'skipped';
          continue;
        }

        // Execute the step with retry logic
        const result = await this.executeStepWithRetry(
          step,
          execution,
          definition
        );

        stepExecution.output = result;
        stepExecution.status = 'completed';
        stepExecution.completedAt = new Date();

        // Update execution context with step output
        this.stateManager.updateContext(
          execution.context,
          step.id,
          result
        );

        this.eventEmitter.emit('step.completed', {
          stepId: step.id,
          output: result,
        });
      } catch (error) {
        stepExecution.status = 'failed';
        stepExecution.completedAt = new Date();

        const shouldRetry = await this.handleStepError(
          error,
          step,
          stepExecution,
          definition,
          execution
        );

        if (!shouldRetry) {
          throw error;
        }
      }
    }
  }

  private async executeStepWithRetry(
    step: WorkflowStep,
    execution: WorkflowExecution,
    definition: WorkflowDefinition
  ): Promise<Record<string, unknown>> {
    let lastError: Error | null = null;
    const maxRetries =
      step.errorPolicy?.retryDelay !== undefined
        ? this.config.retryPolicy.maxRetries
        : 1;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.executeStep(
          step,
          execution,
          definition,
          attempt
        );
      } catch (error) {
        lastError = error as Error;

        if (attempt < maxRetries) {
          const delay = this.calculateBackoffDelay(
            attempt,
            step.errorPolicy?.retryDelay || 1000
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  private async executeStep(
    step: WorkflowStep,
    execution: WorkflowExecution,
    definition: WorkflowDefinition,
    attemptNumber: number
  ): Promise<Record<string, unknown>> {
    const stepExecution = execution.steps.find(
      (s) => s.stepId === step.id
    );
    if (!stepExecution) {
      throw new Error(`Step execution not found for ${step.id}`);
    }

    const attempt: AttemptRecord = {
      attemptNumber,
      status: 'success',
      startedAt: new Date(),
    };

    try {
      // For now, return mock execution
      // In real implementation, this would dispatch to appropriate handler
      const result = await this.mockStepExecution(
        step,
        execution
      );

      attempt.status = 'success';
      attempt.completedAt = new Date();
      stepExecution.attempts.push(attempt);

      return result;
    } catch (error) {
      attempt.status = 'failure';
      attempt.completedAt = new Date();
      attempt.error =
        error instanceof Error ? error.message : 'Unknown error';
      stepExecution.attempts.push(attempt);

      throw error;
    }
  }

  private async mockStepExecution(
    step: WorkflowStep,
    execution: WorkflowExecution
  ): Promise<Record<string, unknown>> {
    // Simulate step execution
    return {
      stepId: step.id,
      status: 'completed',
      timestamp: new Date(),
      data: step.outputs || {},
    };
  }

  private shouldExecuteStep(
    step: WorkflowStep,
    execution: WorkflowExecution
  ): boolean {
    // Check if previous steps have completed successfully
    // In real implementation, check branch conditions
    return true;
  }

  private async handleStepError(
    error: unknown,
    step: WorkflowStep,
    stepExecution: StepExecution,
    definition: WorkflowDefinition,
    execution: WorkflowExecution
  ): Promise<boolean> {
    const policy = step.errorPolicy ||
      definition.errorHandling.onAgentFailure;

    return this.errorHandler.handleError(
      error,
      policy,
      execution
    );
  }

  private calculateBackoffDelay(
    attemptNumber: number,
    initialDelay: number
  ): number {
    return (
      initialDelay *
      Math.pow(
        this.config.retryPolicy.backoffMultiplier,
        attemptNumber - 1
      )
    );
  }
}
