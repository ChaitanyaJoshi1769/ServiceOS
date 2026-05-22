import { PluginHooks } from '@serviceos/plugin-system';
import * as crypto from 'crypto';

export class DataEncryptionPlugin {
  private encryptionKey: Buffer;
  private sensitiveFields: Set<string>;

  constructor(
    private hooks: PluginHooks,
    config: { encryptionKey: string; sensitiveFields: string[] }
  ) {
    this.encryptionKey = Buffer.from(config.encryptionKey, 'hex');
    this.sensitiveFields = new Set(config.sensitiveFields);
  }

  async initialize(): Promise<void> {
    this.hooks.register('workflow.beforeSave', this.encryptSensitiveData.bind(this));
    this.hooks.register('workflow.afterLoad', this.decryptSensitiveData.bind(this));
  }

  private async encryptSensitiveData(context: Record<string, unknown>): Promise<void> {
    const workflow = context.workflow as Record<string, unknown>;

    if (!workflow.input) return;

    const input = workflow.input as Record<string, unknown>;
    for (const field of this.sensitiveFields) {
      if (field in input && input[field]) {
        input[field] = this.encrypt(String(input[field]));
      }
    }
  }

  private async decryptSensitiveData(context: Record<string, unknown>): Promise<void> {
    const workflow = context.workflow as Record<string, unknown>;

    if (!workflow.input) return;

    const input = workflow.input as Record<string, unknown>;
    for (const field of this.sensitiveFields) {
      if (field in input && input[field] && this.isEncrypted(input[field])) {
        input[field] = this.decrypt(input[field] as string);
      }
    }
  }

  private encrypt(data: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `enc:${iv.toString('hex')}:${encrypted}`;
  }

  private decrypt(encryptedData: string): string {
    if (!this.isEncrypted(encryptedData)) return encryptedData;

    const [, ivHex, encrypted] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', this.encryptionKey, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  private isEncrypted(data: unknown): boolean {
    return typeof data === 'string' && data.startsWith('enc:');
  }
}
