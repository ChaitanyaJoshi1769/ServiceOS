export interface AgentExecutionResult {
  success: boolean;
  output?: Record<string, unknown>;
  error?: string;
  toolCalls: ToolCallRecord[];
}

export interface ToolCallRecord {
  toolName: string;
  inputs: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
}
