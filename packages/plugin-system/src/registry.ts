import { Logger } from '@serviceos/shared';
const logger = new Logger('PluginRegistry');
export class PluginRegistry {
  private plugins: Map<string, any> = new Map();
  async register(pluginId: string, plugin: any) {
    logger.info(`Registering plugin: ${pluginId}`);
    this.plugins.set(pluginId, plugin);
    return { registered: true };
  }
  async load(pluginId: string) {
    return this.plugins.get(pluginId);
  }
  async list() {
    return { plugins: Array.from(this.plugins.keys()), count: this.plugins.size };
  }
}
