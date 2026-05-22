import { KnowledgeGraph, Entity, Relationship } from '@serviceos/types';

export class KnowledgeGraphQuery {
  constructor(private kg: KnowledgeGraph) {}

  findEntityByName(name: string): Entity | undefined {
    return this.kg.entities.find((e) => e.name === name);
  }

  findEntitiesByType(type: string): Entity[] {
    return this.kg.entities.filter((e) => e.type === type);
  }

  findRelationships(sourceId: string, targetId?: string): Relationship[] {
    return this.kg.relationships.filter((r) => {
      if (targetId) {
        return r.sourceEntityId === sourceId && r.targetEntityId === targetId;
      }
      return r.sourceEntityId === sourceId;
    });
  }

  findIncomingRelationships(targetId: string): Relationship[] {
    return this.kg.relationships.filter((r) => r.targetEntityId === targetId);
  }

  traversePath(startEntityId: string, maxDepth: number = 3): Entity[] {
    const visited = new Set<string>();
    const result: Entity[] = [];

    const traverse = (entityId: string, depth: number) => {
      if (depth > maxDepth || visited.has(entityId)) return;
      visited.add(entityId);

      const entity = this.kg.entities.find((e) => e.id === entityId);
      if (entity) result.push(entity);

      const relationships = this.findRelationships(entityId);
      relationships.forEach((rel) => {
        traverse(rel.targetEntityId, depth + 1);
      });
    };

    traverse(startEntityId, 0);
    return result;
  }
}
