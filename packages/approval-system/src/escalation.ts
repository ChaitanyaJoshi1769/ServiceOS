import { ApprovalRequest } from '@serviceos/types';
import { Logger } from '@serviceos/shared';

const logger = new Logger('ApprovalEscalation');

export class ApprovalEscalation {
  async escalate(approval: ApprovalRequest): Promise<void> {
    logger.info(`Escalating approval ${approval.id}`);

    const policy = approval.policy;
    if (!policy.escalationPath || policy.escalationPath.length === 0) {
      logger.warn(`No escalation path defined for approval ${approval.id}`);
      return;
    }

    // Move to next escalation level
    const nextEscalationLevel = (approval as any).escalationLevel || 0;
    if (nextEscalationLevel >= policy.escalationPath.length) {
      logger.warn(`Approval ${approval.id} has exhausted all escalation levels`);
      return;
    }

    logger.info(`Escalating approval to level ${nextEscalationLevel + 1}`);
    (approval as any).escalationLevel = nextEscalationLevel + 1;
  }

  async checkForEscalation(approval: ApprovalRequest): Promise<boolean> {
    const now = new Date();
    const halfLife = approval.expiresAt.getTime() - new Date(approval.requestedAt).getTime();
    const halfWayPoint = new Date(
      new Date(approval.requestedAt).getTime() + halfLife / 2
    );

    if (now >= halfWayPoint && !(approval as any).escalated) {
      (approval as any).escalated = true;
      await this.escalate(approval);
      return true;
    }

    return false;
  }

  async getEscalationStatus(approval: ApprovalRequest): Promise<{
    level: number;
    total: number;
    escalationPath: string[];
  }> {
    const escalationPath = approval.policy.escalationPath || [];
    const level = (approval as any).escalationLevel || 0;

    return {
      level,
      total: escalationPath.length,
      escalationPath,
    };
  }
}
