import { PluginRegistry } from '@serviceos/plugin-system';
import { SlackNotificationsPlugin } from './plugin';

async function setupSlackPlugin() {
  const registry = new PluginRegistry();

  // Initialize plugin with Slack configuration
  const plugin = new SlackNotificationsPlugin(
    registry.hooks,
    registry,
    {
      webhookUrl: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL',
      channels: {
        'workflows': 'serviceos-workflows',
        'approvals': 'serviceos-approvals',
        'alerts': 'serviceos-alerts'
      }
    }
  );

  await plugin.initialize();

  // Workflow events will now automatically send Slack notifications
  console.log('Slack notifications plugin initialized');
}

setupSlackPlugin().catch(console.error);
