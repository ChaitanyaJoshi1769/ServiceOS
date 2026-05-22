import { OperationalMemory, MemoryMetadata } from '@serviceos/types';

export class MemoryStore {
  private episodic: OperationalMemory[] = [];
  private semantic: OperationalMemory[] = [];
  private procedural: OperationalMemory[] = [];

  async store(memory: OperationalMemory): Promise<void> {
    const store = this.getStoreForType(memory.type);
    store.push(memory);

    // Handle TTL
    if (memory.ttl) {
      setTimeout(() => {
        this.remove(memory.type, memory.content);
      }, memory.ttl * 1000);
    }
  }

  async retrieve(
    type: 'episodic' | 'semantic' | 'procedural',
    query?: string
  ): Promise<OperationalMemory[]> {
    const store = this.getStoreForType(type);

    if (!query) {
      return store;
    }

    // Simple keyword matching
    return store.filter((memory) => {
      const content = JSON.stringify(memory.content).toLowerCase();
      return query.toLowerCase().split(' ').some((word) => content.includes(word));
    });
  }

  async retrieveBySource(
    sourceId: string
  ): Promise<OperationalMemory[]> {
    const all = [
      ...this.episodic,
      ...this.semantic,
      ...this.procedural,
    ];

    return all.filter((m) => m.metadata.sourceId === sourceId);
  }

  private remove(type: 'episodic' | 'semantic' | 'procedural', content: unknown): void {
    const store = this.getStoreForType(type);
    const index = store.findIndex((m) => m.content === content);
    if (index >= 0) {
      store.splice(index, 1);
    }
  }

  private getStoreForType(
    type: 'episodic' | 'semantic' | 'procedural'
  ): OperationalMemory[] {
    switch (type) {
      case 'episodic':
        return this.episodic;
      case 'semantic':
        return this.semantic;
      case 'procedural':
        return this.procedural;
    }
  }
}
