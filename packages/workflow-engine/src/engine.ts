import {
  WorkflowDefinition,
  WorkflowExecution,
  ExecutionContext,
  StepExecution,
} from '@serviceos/types';
import { WorkflowExecutor } from './executor';
import { StateManager } from './state-manager';
import { ErrorHandler } from './error-handler';
import { EventEmitter } from './event-emitter';

export interface WorkflowEngineConfig {
  maxConcurrentExecutions: number;
  defaultTimeout: number;
  retryPolicy: {
    maxRetries: number;
    backoffMultiplier: number;
  };
}

export class WorkflowEngine {
  private config: WorkflowEngineConfig;
  private executor: WorkflowExecutor;
  private stateManager: StateManager;
  private errorHandler: ErrorHandler;
  private eventEmitter: EventEmitter;
  private activeExecutions: Map<string, WorkflowExecution>;

  constructor(config: Partial<WorkflowEngineConfig> = {}) {
    this.config = {
      maxConcurrentExecutions: config.maxConcurrentExecutions || 1000,
      defaultTimeout: config.defaultTimeout || 3600000, // 1 hour
      retryPolicy: config.retryPolicy || {
        maxRetries: 3,
        backoffMultiplier: 2,
      },
    };

    this.activeExecutions = new Map();
    this.eventEmitter = new EventEmitter();
    this.stateManager = new StateManager();
    this.errorHandler = new ErrorHandler(this.config.retryPolicy);
    this.executor = new WorkflowExecutor(
      this.stateManager,
      this.errorHandler,
      this.eventEmitter,
      this.config
    );
  }

  async executeWorkflow(
    definition: WorkflowDefinition,
    context: Partial<ExecutionContext> = {}
  ): Promise<WorkflowExecution> {
    if (this.activeExecutions.size >= this.config.maxConcurrentExecutions) {
      throw new Error('Maximum concurrent executions reached');
    }

    const execution = this.initializeExecution(definition, context);
    this.activeExecutions.set(execution.id, execution);

    try {
      await this.executor.execute(definition, execution);
      execution.status = 'completed';
      execution.completedAt = new Date();
    } catch (error) {
      execution.status = 'failed';
      execution.completedAt = new Date();
      execution.errors = execution.errors || [];
      execution.errors.push({
        stepId: execution.currentStepId || 'unknown',
        timestamp: new Date(),
        code: 'WORKFLOW_EXECUTION_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      this.activeExecutions.delete(execution.id);
    }

    return execution;
  }

  async pauseExecution(executionId: string): Promise<void> {
    const execution = this.activeExecutions.get(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }
    execution.status = 'paused';
    this.eventEmitter.emit('execution.paused', { executionId });
  }

  async resumeExecution(executionId: string): Promise<void> {
    const execution = this.activeExecutions.get(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }
    execution.status = 'running';
    this.eventEmitter.emit('execution.resumed', { executionId });
  }

  async cancelExecution(executionId: string): Promise<void> {
    const execution = this.activeExecutions.get(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }
    execution.status = 'cancelled';
    execution.completedAt = new Date();
    this.eventEmitter.emit('execution.cancelled', { executionId });
  }

  getExecution(executionId: string): WorkflowExecution | undefined {
    return this.activeExecutions.get(executionId);
  }

  onEvent(event: string, listener: (data: unknown) => void): void {
    this.eventEmitter.on(event, listener);
  }

  private initializeExecution(
    definition: WorkflowDefinition,
    context: Partial<ExecutionContext>
  ): WorkflowExecution {
    return {
      id: this.generateId(),
      organizationId: '', // Will be set by caller
      workflowId: definition.id,
      workflowVersion: definition.version,
      status: 'pending',
      context: {
        variables: context.variables || {},
        documents: context.documents || [],
        approvals: context.approvals || [],
        decisions: context.decisions || [],
        metadata: context.metadata || {},
      },
      steps: definition.steps.map((step) => ({
        id: step.id,
        stepId: step.id,
        status: 'pending',
        attempts: [],
      })),
      startedAt: new Date(),
      createdBy: '', // Will be set by caller
      triggeredBy: definition.triggers[0] || { type: 'manual', config: {} },
    };
  }

  private generateId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
