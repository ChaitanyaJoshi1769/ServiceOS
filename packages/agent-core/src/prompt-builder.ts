import { AgentDefinition, AgentContext, OperationalMemory } from '@serviceos/types';

export class PromptBuilder {
  private definition: AgentDefinition;

  constructor(definition: AgentDefinition) {
    this.definition = definition;
  }

  buildSystemPrompt(memories: OperationalMemory[]): string {
    let prompt = 'You are an AI agent with the following role and responsibilities.\n\n';

    prompt += `## Role: ${this.definition.role}\n`;
    prompt += `Description: ${this.definition.description || 'N/A'}\n\n`;

    if (this.definition.persona) {
      prompt += `## Persona\n${this.definition.persona}\n\n`;
    }

    prompt += `## Capabilities\n`;
    this.definition.capabilities.forEach((cap) => {
      prompt += `- ${cap}\n`;
    });

    prompt += `\n## Tools Available\n`;
    this.definition.tools.forEach((tool) => {
      prompt += `- ${tool.name}: ${tool.description}\n`;
    });

    if (this.definition.constraints && this.definition.constraints.length > 0) {
      prompt += `\n## Constraints\n`;
      this.definition.constraints.forEach((constraint) => {
        prompt += `- ${constraint.type}: ${constraint.value}\n`;
      });
    }

    if (memories.length > 0) {
      prompt += `\n## Relevant Memories and Context\n`;
      memories.slice(0, 5).forEach((memory) => {
        prompt += `- ${JSON.stringify(memory.content)}\n`;
      });
    }

    return prompt;
  }

  buildUserPrompt(
    instruction: string,
    context: AgentContext
  ): string {
    let prompt = `## Task\n${instruction}\n\n`;

    prompt += `## Context\n`;
    prompt += `- Workflow: ${context.workflowName}\n`;
    prompt += `- Current Step: ${context.stepName}\n`;

    if (context.customerInfo) {
      prompt += `\n## Customer Information\n`;
      Object.entries(context.customerInfo).forEach(([key, value]) => {
        prompt += `- ${key}: ${value}\n`;
      });
    }

    if (context.documentReferences && context.documentReferences.length > 0) {
      prompt += `\n## Available Documents\n`;
      context.documentReferences.forEach((doc) => {
        prompt += `- ${doc.filename} (${doc.documentId})\n`;
      });
    }

    if (context.previousStepOutputs && Object.keys(context.previousStepOutputs).length > 0) {
      prompt += `\n## Previous Step Outputs\n`;
      prompt += JSON.stringify(context.previousStepOutputs, null, 2);
    }

    prompt += `\n## Instructions\n`;
    prompt += `1. Think through the task step by step\n`;
    prompt += `2. Use available tools if needed\n`;
    prompt += `3. Provide clear reasoning for decisions\n`;
    prompt += `4. Return results in structured JSON format\n`;

    return prompt;
  }
}
