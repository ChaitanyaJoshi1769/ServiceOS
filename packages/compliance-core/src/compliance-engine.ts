import {
  CompliancePolicy,
  ComplianceRecord,
  AuditEvent,
} from '@serviceos/types';
import { PolicyEvaluator } from './policy-evaluator';
import { AuditLog } from './audit-log';

export class ComplianceEngine {
  private policies: Map<string, CompliancePolicy> = new Map();
  private records: ComplianceRecord[] = [];
  private auditLog: AuditLog;
  private evaluator: PolicyEvaluator;

  constructor() {
    this.auditLog = new AuditLog();
    this.evaluator = new PolicyEvaluator();
  }

  registerPolicy(policy: CompliancePolicy): void {
    this.policies.set(policy.id, policy);
  }

  async evaluateCompliance(
    organizationId: string,
    context: Record<string, unknown>
  ): Promise<ComplianceRecord[]> {
    const results: ComplianceRecord[] = [];

    for (const policy of this.policies.values()) {
      if (policy.status !== 'active') continue;

      const isCompliant = await this.evaluator.evaluate(
        policy,
        context
      );

      const record: ComplianceRecord = {
        id: `compliance_${Date.now()}`,
        organizationId,
        policyId: policy.id,
        status: isCompliant ? 'compliant' : 'non-compliant',
        evidenceDocuments: [],
        testedAt: new Date(),
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      };

      results.push(record);
      this.records.push(record);
    }

    return results;
  }

  getComplianceStatus(organizationId: string): {
    compliant: number;
    nonCompliant: number;
    total: number;
  } {
    const records = this.records.filter(
      (r) => r.organizationId === organizationId
    );

    return {
      compliant: records.filter((r) => r.status === 'compliant').length,
      nonCompliant: records.filter((r) => r.status === 'non-compliant').length,
      total: records.length,
    };
  }

  logAuditEvent(event: AuditEvent): void {
    this.auditLog.logEvent(event);
  }
}
