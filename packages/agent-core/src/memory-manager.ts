import {
  AgentExecution,
  AgentContext,
  OperationalMemory,
} from '@serviceos/types';

export class MemoryManager {
  private memories: OperationalMemory[] = [];

  async retrieve(
    query: string,
    context: AgentContext
  ): Promise<OperationalMemory[]> {
    // In production, this would use vector search
    // For now, return relevant memories based on keywords

    const keywords = query.toLowerCase().split(' ');

    const relevant = this.memories.filter((memory) => {
      const content = JSON.stringify(memory.content).toLowerCase();
      return keywords.some((keyword) => content.includes(keyword));
    });

    return relevant.slice(0, 5); // Return top 5 relevant memories
  }

  async store(execution: AgentExecution): Promise<void> {
    // Store agent execution in memory for future reference

    const memory: OperationalMemory = {
      organizationId: execution.organizationId,
      type: 'episodic',
      content: {
        instruction: execution.instruction,
        output: execution.output,
        reasoning: execution.reasoning,
      },
      metadata: {
        sourceType: 'agent',
        sourceId: execution.agentId,
        timestamp: execution.completedAt || new Date(),
        tags: ['agent_execution'],
      },
      ttl: 30 * 24 * 60 * 60, // 30 days
    };

    this.memories.push(memory);
  }

  async clear(): Promise<void> {
    this.memories = [];
  }

  async getMemories(): Promise<OperationalMemory[]> {
    return this.memories;
  }
}
