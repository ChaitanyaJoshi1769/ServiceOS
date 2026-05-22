import { Logger } from '@serviceos/shared';
const logger = new Logger('PluginHooks');
export class PluginHooks {
  private hooks: Map<string, any[]> = new Map();
  register(hookName: string, callback: any) {
    if (!this.hooks.has(hookName)) this.hooks.set(hookName, []);
    this.hooks.get(hookName)!.push(callback);
  }
  async execute(hookName: string, ...args: any[]) {
    const callbacks = this.hooks.get(hookName) || [];
    return Promise.all(callbacks.map(cb => cb(...args)));
  }
}
