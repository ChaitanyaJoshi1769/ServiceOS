import { CompliancePolicy } from '@serviceos/types';

export class PolicyEvaluator {
  async evaluate(
    policy: CompliancePolicy,
    context: Record<string, unknown>
  ): Promise<boolean> {
    // Evaluate all rules
    for (const rule of policy.rules) {
      const rulePass = this.evaluateRule(rule.condition, context);
      if (!rulePass && rule.severity === 'critical') {
        return false;
      }
    }

    return true;
  }

  private evaluateRule(
    condition: string,
    context: Record<string, unknown>
  ): boolean {
    try {
      const func = new Function('ctx', `return ${condition}`);
      return Boolean(func(context));
    } catch (error) {
      console.error(`Error evaluating rule: ${condition}`, error);
      return false;
    }
  }
}
