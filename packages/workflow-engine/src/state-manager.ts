import { ExecutionContext } from '@serviceos/types';

export class StateManager {
  updateContext(
    context: ExecutionContext,
    stepId: string,
    output: Record<string, unknown>
  ): void {
    // Store step output in context
    if (!context.metadata) {
      context.metadata = {};
    }

    context.metadata[`step_${stepId}`] = {
      output,
      timestamp: new Date().toISOString(),
    };

    // Make output available to subsequent steps via variables
    context.variables[stepId] = output;
  }

  getStepOutput(
    context: ExecutionContext,
    stepId: string
  ): unknown {
    return context.variables[stepId];
  }

  setVariable(
    context: ExecutionContext,
    name: string,
    value: unknown
  ): void {
    context.variables[name] = value;
  }

  getVariable(
    context: ExecutionContext,
    name: string
  ): unknown {
    return context.variables[name];
  }

  resolveExpression(
    context: ExecutionContext,
    expression: string
  ): unknown {
    // Simple expression resolver
    // In production, use a DSL parser like jsonLogic or similar
    try {
      const func = new Function(
        'ctx',
        `return ${expression}`
      );
      return func(context.variables);
    } catch (error) {
      throw new Error(
        `Failed to resolve expression: ${expression}`
      );
    }
  }
}
