import { OperationalMemory } from '@serviceos/types';
import { MemoryStore } from './memory-store';
import { VectorStore } from './vector-store';

export class MemoryRetriever {
  private memoryStore: MemoryStore;
  private vectorStore: VectorStore;

  constructor() {
    this.memoryStore = new MemoryStore();
    this.vectorStore = new VectorStore();
  }

  async retrieveRelevant(
    query: string,
    organizationId: string,
    topK: number = 5
  ): Promise<OperationalMemory[]> {
    // Try vector search first if embedding available
    // Fall back to keyword search

    // For now, use keyword search
    const results = await this.memoryStore.retrieve('semantic', query);
    return results.slice(0, topK);
  }

  async storeMemory(
    memory: OperationalMemory,
    embedding?: number[]
  ): Promise<void> {
    await this.memoryStore.store(memory);
    if (embedding) {
      await this.vectorStore.store(memory, embedding);
    }
  }
}
