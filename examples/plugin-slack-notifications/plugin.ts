import { PluginHooks, PluginRegistry } from '@serviceos/plugin-system';

export class SlackNotificationsPlugin {
  private webhookUrl: string;
  private channelMappings: Map<string, string>;

  constructor(
    private hooks: PluginHooks,
    private registry: PluginRegistry,
    private config: { webhookUrl: string; channels: Record<string, string> }
  ) {
    this.webhookUrl = config.webhookUrl;
    this.channelMappings = new Map(Object.entries(config.channels || {}));
  }

  async initialize(): Promise<void> {
    // Register hooks
    this.hooks.register('workflow.onStart', this.onWorkflowStart.bind(this));
    this.hooks.register('workflow.onComplete', this.onWorkflowComplete.bind(this));
    this.hooks.register('workflow.onError', this.onWorkflowError.bind(this));
    this.hooks.register('approval.created', this.onApprovalCreated.bind(this));

    // Register tool
    this.registry.register('sendSlackMessage', {
      name: 'sendSlackMessage',
      description: 'Send a message to a Slack channel',
      parameters: {
        type: 'object',
        properties: {
          channel: { type: 'string', description: 'Slack channel name' },
          message: { type: 'string', description: 'Message text' },
          blocks: { type: 'array', description: 'Slack block kit blocks' }
        }
      },
      execute: this.sendSlackMessage.bind(this)
    });
  }

  private async onWorkflowStart(context: Record<string, unknown>): Promise<void> {
    const workflowName = context.workflowName as string;
    const message = `🚀 Workflow started: ${workflowName}`;
    await this.sendSlackMessage({
      channel: 'workflows',
      message
    });
  }

  private async onWorkflowComplete(context: Record<string, unknown>): Promise<void> {
    const workflowName = context.workflowName as string;
    const duration = context.duration as number;
    const message = `✅ Workflow completed: ${workflowName} (${duration}ms)`;
    await this.sendSlackMessage({
      channel: 'workflows',
      message
    });
  }

  private async onWorkflowError(context: Record<string, unknown>): Promise<void> {
    const workflowName = context.workflowName as string;
    const error = context.error as string;
    const message = `❌ Workflow failed: ${workflowName}\n\`\`\`${error}\`\`\``;
    await this.sendSlackMessage({
      channel: 'alerts',
      message
    });
  }

  private async onApprovalCreated(context: Record<string, unknown>): Promise<void> {
    const title = context.title as string;
    const assignees = (context.assignees as string[]).join(', ');
    const message = `📋 Approval request: ${title}\nAssigned to: ${assignees}`;
    await this.sendSlackMessage({
      channel: 'approvals',
      message
    });
  }

  private async sendSlackMessage(params: Record<string, unknown>): Promise<unknown> {
    const channel = params.channel as string;
    const message = params.message as string;

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: `#${channel}`,
          text: message
        })
      });

      if (!response.ok) {
        throw new Error(`Slack API error: ${response.statusText}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to send Slack message:', error);
      return { success: false, error: (error as Error).message };
    }
  }
}
