import { AuditEvent } from '@serviceos/types';

export class AuditLog {
  private events: AuditEvent[] = [];

  logEvent(event: AuditEvent): void {
    // Ensure immutability
    const frozenEvent = Object.freeze({
      ...event,
      timestamp: new Date(event.timestamp),
    });

    this.events.push(frozenEvent);
  }

  getEvents(
    organizationId: string,
    filters?: {
      action?: string;
      resourceType?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): AuditEvent[] {
    let result = this.events.filter(
      (e) => e.organizationId === organizationId
    );

    if (filters?.action) {
      result = result.filter((e) => e.action === filters.action);
    }

    if (filters?.resourceType) {
      result = result.filter((e) => e.resourceType === filters.resourceType);
    }

    if (filters?.startDate) {
      result = result.filter((e) => e.timestamp >= filters.startDate!);
    }

    if (filters?.endDate) {
      result = result.filter((e) => e.timestamp <= filters.endDate!);
    }

    return result;
  }

  getEventCount(organizationId: string): number {
    return this.events.filter((e) => e.organizationId === organizationId).length;
  }
}
