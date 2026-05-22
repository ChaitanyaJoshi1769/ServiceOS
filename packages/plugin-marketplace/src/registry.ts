import { Logger } from '@serviceos/shared';

const logger = new Logger('MarketplaceRegistry');

export interface RegisteredPlugin {
  id: string;
  name: string;
  version: string;
  owner: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  publishedAt?: Date;
  metrics: {
    downloads: number;
    activeInstallations: number;
    errorRate: number;
  };
}

export class PluginRegistry {
  private registeredPlugins: Map<string, RegisteredPlugin>;

  constructor() {
    this.registeredPlugins = new Map();
  }

  async registerPlugin(
    name: string,
    version: string,
    owner: string,
    pluginPackage: Buffer
  ): Promise<string> {
    logger.info(`Registering plugin ${name}@${version} by ${owner}`);

    const pluginId = `plugin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const registered: RegisteredPlugin = {
      id: pluginId,
      name,
      version,
      owner,
      approvalStatus: 'pending',
      metrics: {
        downloads: 0,
        activeInstallations: 0,
        errorRate: 0,
      },
    };

    this.registeredPlugins.set(pluginId, registered);
    logger.info(`Plugin registered with ID: ${pluginId}`);

    return pluginId;
  }

  async approvePlugin(pluginId: string): Promise<void> {
    const plugin = this.registeredPlugins.get(pluginId);
    if (plugin) {
      plugin.approvalStatus = 'approved';
      plugin.publishedAt = new Date();
      logger.info(`Plugin ${pluginId} approved and published`);
    }
  }

  async rejectPlugin(pluginId: string, reason: string): Promise<void> {
    const plugin = this.registeredPlugins.get(pluginId);
    if (plugin) {
      plugin.approvalStatus = 'rejected';
      logger.info(`Plugin ${pluginId} rejected: ${reason}`);
    }
  }

  async getPluginMetrics(pluginId: string): Promise<RegisteredPlugin | null> {
    return this.registeredPlugins.get(pluginId) || null;
  }

  async getPendingApprovals(): Promise<RegisteredPlugin[]> {
    return Array.from(this.registeredPlugins.values()).filter(
      p => p.approvalStatus === 'pending'
    );
  }
}
