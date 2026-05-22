import { OperationalMemory } from '@serviceos/types';

export class VectorStore {
  private memories: Map<string, OperationalMemory & { id: string }> = new Map();

  async store(memory: OperationalMemory, embedding: number[]): Promise<string> {
    const id = this.generateId();
    this.memories.set(id, { ...memory, id, embedding });
    return id;
  }

  async search(
    query: number[],
    topK: number = 5
  ): Promise<OperationalMemory[]> {
    const results = Array.from(this.memories.values())
      .map((memory) => ({
        memory: memory as OperationalMemory,
        score: this.cosineSimilarity(query, memory.embedding || []),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map((r) => r.memory);

    return results;
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private generateId(): string {
    return `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
