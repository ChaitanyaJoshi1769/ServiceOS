import {
  AgentDefinition,
  AgentExecution,
  AgentContext,
  ToolCall,
} from '@serviceos/types';
import { ToolRegistry } from './tool-registry';
import { PromptBuilder } from './prompt-builder';
import { MemoryManager } from './memory-manager';

export class Agent {
  private definition: AgentDefinition;
  private toolRegistry: ToolRegistry;
  private promptBuilder: PromptBuilder;
  private memoryManager: MemoryManager;

  constructor(
    definition: AgentDefinition,
    toolRegistry: ToolRegistry,
    memoryManager: MemoryManager
  ) {
    this.definition = definition;
    this.toolRegistry = toolRegistry;
    this.memoryManager = memoryManager;
    this.promptBuilder = new PromptBuilder(definition);
  }

  async execute(
    instruction: string,
    context: AgentContext
  ): Promise<AgentExecution> {
    const execution: AgentExecution = {
      id: this.generateId(),
      organizationId: '', // Will be set by caller
      workflowExecutionId: '',
      stepExecutionId: '',
      agentId: this.definition.id,
      status: 'assigned',
      instruction,
      tools: this.definition.tools.map((t) => t.name),
      context,
      startedAt: new Date(),
      toolCalls: [],
      tokensUsed: { input: 0, output: 0 },
    };

    try {
      // Retrieve relevant memories
      const memories = await this.memoryManager.retrieve(
        instruction,
        context
      );

      // Build system prompt
      const systemPrompt = this.promptBuilder.buildSystemPrompt(
        memories
      );

      // Build user prompt with context
      const userPrompt =
        this.promptBuilder.buildUserPrompt(instruction, context);

      // In production, call Claude API
      const response = await this.callAI(
        systemPrompt,
        userPrompt,
        execution
      );

      execution.status = 'completed';
      execution.completedAt = new Date();
      execution.output = response;

      // Store execution in memory
      await this.memoryManager.store(execution);

      return execution;
    } catch (error) {
      execution.status = 'failed';
      execution.completedAt = new Date();
      throw error;
    }
  }

  private async callAI(
    systemPrompt: string,
    userPrompt: string,
    execution: AgentExecution
  ): Promise<Record<string, unknown>> {
    // Mock AI call - in production, integrate Claude API
    // This would use the model specified in the agent definition

    return {
      reasoning: 'Agent is processing the task...',
      action: 'Task executed successfully',
      result: { status: 'completed' },
    };
  }

  async executeTool(toolCall: ToolCall): Promise<unknown> {
    const tool = this.toolRegistry.getTool(toolCall.toolName);
    if (!tool) {
      throw new Error(`Tool not found: ${toolCall.toolName}`);
    }

    try {
      const result = await tool.execute(toolCall.inputs);
      toolCall.status = 'completed';
      toolCall.output = result;
      toolCall.executedAt = new Date();
      return result;
    } catch (error) {
      toolCall.status = 'failed';
      toolCall.error = error instanceof Error ? error.message : String(error);
      toolCall.executedAt = new Date();
      throw error;
    }
  }

  getId(): string {
    return this.definition.id;
  }

  getRole(): string {
    return this.definition.role;
  }

  getCapabilities(): string[] {
    return this.definition.capabilities;
  }

  private generateId(): string {
    return `agent_exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
