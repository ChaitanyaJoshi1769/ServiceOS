import { Logger } from '@serviceos/shared';
const logger = new Logger('PluginLoader');
export class PluginLoader {
  async loadPlugin(pluginPath: string) {
    logger.info(`Loading plugin from ${pluginPath}`);
    return { loaded: true, pluginId: `plugin_${Date.now()}` };
  }
  async unloadPlugin(pluginId: string) {
    logger.info(`Unloading plugin ${pluginId}`);
    return { unloaded: true };
  }
  async reloadPlugin(pluginId: string) {
    return { reloaded: true };
  }
}
