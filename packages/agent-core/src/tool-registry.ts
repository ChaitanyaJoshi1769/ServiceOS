import { ToolDefinition } from '@serviceos/types';

export interface Tool {
  name: string;
  description: string;
  execute(inputs: Record<string, unknown>): Promise<unknown>;
}

export class ToolRegistry {
  private tools: Map<string, Tool>;

  constructor() {
    this.tools = new Map();
  }

  registerTool(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }

  getTool(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  getAllTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  getToolsForAgent(
    toolDefinitions: ToolDefinition[]
  ): Tool[] {
    return toolDefinitions
      .map((def) => this.getTool(def.name))
      .filter((tool): tool is Tool => tool !== undefined);
  }

  removeTool(name: string): boolean {
    return this.tools.delete(name);
  }
}

// Built-in tools
export class DocumentLoaderTool implements Tool {
  name = 'load_document';
  description = 'Load and read a document';

  async execute(
    inputs: Record<string, unknown>
  ): Promise<unknown> {
    // Implementation for loading documents
    return {
      documentId: inputs.documentId,
      content: 'Mock document content',
    };
  }
}

export class KnowledgeGraphQueryTool implements Tool {
  name = 'query_knowledge_graph';
  description = 'Query the knowledge graph';

  async execute(
    inputs: Record<string, unknown>
  ): Promise<unknown> {
    // Implementation for knowledge graph queries
    return {
      query: inputs.query,
      results: [],
    };
  }
}

export class ApprovalRequestTool implements Tool {
  name = 'request_approval';
  description = 'Request approval for an action';

  async execute(
    inputs: Record<string, unknown>
  ): Promise<unknown> {
    // Implementation for requesting approvals
    return {
      approvalId: `approval_${Date.now()}`,
      status: 'pending',
    };
  }
}

export class SendCommunicationTool implements Tool {
  name = 'send_communication';
  description = 'Send email, message, or notification';

  async execute(
    inputs: Record<string, unknown>
  ): Promise<unknown> {
    // Implementation for sending communications
    return {
      communicationId: `comm_${Date.now()}`,
      status: 'sent',
    };
  }
}
