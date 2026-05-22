import { Rule, Entity } from '@serviceos/types';

export class RuleEngine {
  private rules: Rule[] = [];

  addRule(rule: Rule): void {
    this.rules.push(rule);
  }

  evaluateRules(
    entity: Entity,
    entities: Entity[]
  ): string[] {
    const results: string[] = [];

    const applicableRules = this.rules.filter((r) => r.domain === entity.type);

    applicableRules.sort((a, b) => b.priority - a.priority);

    for (const rule of applicableRules) {
      try {
        if (this.evaluateCondition(rule.condition, entity, entities)) {
          results.push(rule.consequence);
        }
      } catch (error) {
        console.error(`Error evaluating rule ${rule.id}:`, error);
      }
    }

    return results;
  }

  private evaluateCondition(
    condition: string,
    entity: Entity,
    entities: Entity[]
  ): boolean {
    try {
      const func = new Function(
        'entity',
        'entities',
        `return ${condition}`
      );
      return Boolean(func(entity, entities));
    } catch (error) {
      throw new Error(`Failed to evaluate condition: ${condition}`);
    }
  }
}
