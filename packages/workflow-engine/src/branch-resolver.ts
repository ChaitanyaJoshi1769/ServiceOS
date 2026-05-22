import { WorkflowBranch, ExecutionContext } from '@serviceos/types';

export class BranchResolver {
  resolveBranch(
    branches: WorkflowBranch[],
    context: ExecutionContext
  ): WorkflowBranch | null {
    for (const branch of branches) {
      if (this.evaluateCondition(branch.condition, context)) {
        return branch;
      }
    }
    return null;
  }

  private evaluateCondition(
    condition: string,
    context: ExecutionContext
  ): boolean {
    try {
      const func = new Function(
        'ctx',
        `return ${condition}`
      );
      return Boolean(func(context.variables));
    } catch (error) {
      throw new Error(
        `Failed to evaluate branch condition: ${condition}`
      );
    }
  }
}
