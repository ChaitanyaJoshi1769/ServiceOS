export interface WorkflowEngineConfig {
  maxConcurrentExecutions: number;
  defaultTimeout: number;
  retryPolicy: {
    maxRetries: number;
    backoffMultiplier: number;
  };
}

export interface StepHandler {
  handle(step: unknown, context: unknown): Promise<unknown>;
}

export interface ExecutionEvent {
  type: string;
  timestamp: Date;
  data: Record<string, unknown>;
}
