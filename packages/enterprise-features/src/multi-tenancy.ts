import { Logger } from '@serviceos/shared';

const logger = new Logger('MultiTenancyManager');

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  tier: 'starter' | 'professional' | 'enterprise';
  createdAt: Date;
  customization: Record<string, unknown>;
  resourceLimits: {
    maxWorkflows: number;
    maxAgents: number;
    maxStorage: number;
    maxUsers: number;
  };
}

export class MultiTenancyManager {
  private tenants: Map<string, Tenant>;

  constructor() {
    this.tenants = new Map();
  }

  async createTenant(name: string, domain: string, tier: string): Promise<Tenant> {
    logger.info(`Creating tenant: ${name} (${domain})`);

    const tenant: Tenant = {
      id: `tenant_${Date.now()}`,
      name,
      domain,
      tier: tier as Tenant['tier'],
      createdAt: new Date(),
      customization: {},
      resourceLimits: this.getTierLimits(tier as Tenant['tier']),
    };

    this.tenants.set(tenant.id, tenant);
    return tenant;
  }

  async getTenant(tenantId: string): Promise<Tenant | null> {
    return this.tenants.get(tenantId) || null;
  }

  async updateTenantSettings(tenantId: string, customization: Record<string, unknown>): Promise<void> {
    const tenant = this.tenants.get(tenantId);
    if (tenant) {
      tenant.customization = { ...tenant.customization, ...customization };
      logger.info(`Updated settings for tenant ${tenantId}`);
    }
  }

  async upgradeTenant(tenantId: string, newTier: string): Promise<void> {
    const tenant = this.tenants.get(tenantId);
    if (tenant) {
      tenant.tier = newTier as Tenant['tier'];
      tenant.resourceLimits = this.getTierLimits(newTier as Tenant['tier']);
      logger.info(`Upgraded tenant ${tenantId} to ${newTier}`);
    }
  }

  async checkResourceLimit(tenantId: string, resourceType: string, currentUsage: number): Promise<boolean> {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) return false;

    const limits = tenant.resourceLimits;
    const limitKey = `max${resourceType.charAt(0).toUpperCase()}${resourceType.slice(1)}`;
    const limit = limits[limitKey as keyof typeof limits] as number;

    return currentUsage < limit;
  }

  private getTierLimits(tier: Tenant['tier']) {
    const limits = {
      starter: { maxWorkflows: 10, maxAgents: 5, maxStorage: 5, maxUsers: 3 },
      professional: { maxWorkflows: 100, maxAgents: 50, maxStorage: 100, maxUsers: 50 },
      enterprise: { maxWorkflows: 1000, maxAgents: 500, maxStorage: 1000, maxUsers: 500 },
    };
    return limits[tier];
  }
}
