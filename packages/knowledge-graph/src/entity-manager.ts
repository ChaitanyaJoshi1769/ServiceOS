import { Entity, DocumentReference } from '@serviceos/types';

export class EntityManager {
  private entities: Map<string, Entity> = new Map();

  createEntity(
    type: string,
    name: string,
    attributes: Record<string, unknown>,
    source?: DocumentReference
  ): Entity {
    const entity: Entity = {
      id: `entity_${Date.now()}`,
      type,
      name,
      attributes,
      sourceDocument: source,
    };

    this.entities.set(entity.id, entity);
    return entity;
  }

  getEntity(id: string): Entity | undefined {
    return this.entities.get(id);
  }

  updateEntity(id: string, attributes: Record<string, unknown>): void {
    const entity = this.entities.get(id);
    if (entity) {
      entity.attributes = { ...entity.attributes, ...attributes };
    }
  }

  deleteEntity(id: string): void {
    this.entities.delete(id);
  }

  getAllEntities(): Entity[] {
    return Array.from(this.entities.values());
  }

  getEntitiesByType(type: string): Entity[] {
    return Array.from(this.entities.values()).filter((e) => e.type === type);
  }
}
