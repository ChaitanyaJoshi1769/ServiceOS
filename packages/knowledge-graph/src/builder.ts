import { KnowledgeGraph, Entity, Relationship, Rule } from '@serviceos/types';

export class KnowledgeGraphBuilder {
  private kg: KnowledgeGraph;

  constructor(organizationId: string, domain: string) {
    this.kg = {
      id: `kg_${Date.now()}`,
      organizationId,
      domain,
      entities: [],
      relationships: [],
      rules: [],
    };
  }

  addEntity(entity: Entity): void {
    if (!this.kg.entities.find((e) => e.id === entity.id)) {
      this.kg.entities.push(entity);
    }
  }

  addRelationship(relationship: Relationship): void {
    if (!this.kg.relationships.find((r) => r.id === relationship.id)) {
      this.kg.relationships.push(relationship);
    }
  }

  addRule(rule: Rule): void {
    if (!this.kg.rules.find((r) => r.id === rule.id)) {
      this.kg.rules.push(rule);
    }
  }

  build(): KnowledgeGraph {
    return this.kg;
  }
}
