import {
  AgentDefinition,
  AgentExecution,
  AgentContext,
} from '@serviceos/types';
import { Agent } from './agent';
import { ToolRegistry } from './tool-registry';
import { MemoryManager } from './memory-manager';

export class AgentOrchestrator {
  private agents: Map<string, Agent>;
  private toolRegistry: ToolRegistry;
  private memoryManager: MemoryManager;

  constructor(toolRegistry: ToolRegistry, memoryManager: MemoryManager) {
    this.agents = new Map();
    this.toolRegistry = toolRegistry;
    this.memoryManager = memoryManager;
  }

  registerAgent(definition: AgentDefinition): void {
    const agent = new Agent(
      definition,
      this.toolRegistry,
      this.memoryManager
    );
    this.agents.set(definition.id, agent);
  }

  async assignTask(
    agentId: string,
    instruction: string,
    context: AgentContext
  ): Promise<AgentExecution> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    return agent.execute(instruction, context);
  }

  getAgent(agentId: string): Agent | undefined {
    return this.agents.get(agentId);
  }

  getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  removeAgent(agentId: string): boolean {
    return this.agents.delete(agentId);
  }

  async executeMultiAgentTask(
    agents: string[],
    instruction: string,
    context: AgentContext
  ): Promise<AgentExecution[]> {
    const executions = await Promise.all(
      agents.map((agentId) =>
        this.assignTask(agentId, instruction, context)
      )
    );

    return executions;
  }

  async executeSequentialAgentTask(
    agents: string[],
    instruction: string,
    initialContext: AgentContext
  ): Promise<AgentExecution[]> {
    const executions: AgentExecution[] = [];
    let context = initialContext;

    for (const agentId of agents) {
      const execution = await this.assignTask(
        agentId,
        instruction,
        context
      );
      executions.push(execution);

      // Update context with previous agent's output
      if (execution.output) {
        context = {
          ...context,
          previousStepOutputs: execution.output as Record<
            string,
            unknown
          >,
        };
      }
    }

    return executions;
  }
}
