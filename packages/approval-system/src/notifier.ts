import { ApprovalRequest } from '@serviceos/types';
import { Logger } from '@serviceos/shared';

const logger = new Logger('ApprovalNotifier');

export class ApprovalNotifier {
  async notifyApprovers(approval: ApprovalRequest): Promise<void> {
    logger.info(`Sending approval notifications for ${approval.id}`);

    const approvers = approval.policy.approvers.flatMap((role) => {
      return []; // In production, look up users by role
    });

    for (const approver of approvers) {
      await this.sendNotification(approver, approval);
    }
  }

  async notifyApproved(approval: ApprovalRequest): Promise<void> {
    logger.info(`Notifying workflow executor that approval ${approval.id} was approved`);
    // Send notification to workflow executor
  }

  async notifyRejected(approval: ApprovalRequest, reason?: string): Promise<void> {
    logger.info(`Notifying workflow executor that approval ${approval.id} was rejected`);
    // Send notification to workflow executor with rejection reason
  }

  async notifyExpired(approval: ApprovalRequest): Promise<void> {
    logger.warn(`Approval ${approval.id} expired without decision`);
    // Send expiration notification
  }

  private async sendNotification(
    approver: string,
    approval: ApprovalRequest
  ): Promise<void> {
    const channels = approval.policy.notificationChannels || ['in-app', 'email'];

    for (const channel of channels) {
      switch (channel) {
        case 'email':
          await this.sendEmail(approver, approval);
          break;
        case 'slack':
          await this.sendSlack(approver, approval);
          break;
        case 'teams':
          await this.sendTeams(approver, approval);
          break;
        case 'sms':
          await this.sendSMS(approver, approval);
          break;
        case 'in-app':
          await this.sendInApp(approver, approval);
          break;
      }
    }
  }

  private async sendEmail(approver: string, approval: ApprovalRequest): Promise<void> {
    logger.debug(`Sending email approval notification to ${approver}`);
  }

  private async sendSlack(approver: string, approval: ApprovalRequest): Promise<void> {
    logger.debug(`Sending Slack notification to ${approver}`);
  }

  private async sendTeams(approver: string, approval: ApprovalRequest): Promise<void> {
    logger.debug(`Sending Teams notification to ${approver}`);
  }

  private async sendSMS(approver: string, approval: ApprovalRequest): Promise<void> {
    logger.debug(`Sending SMS notification to ${approver}`);
  }

  private async sendInApp(approver: string, approval: ApprovalRequest): Promise<void> {
    logger.debug(`Creating in-app notification for ${approver}`);
  }
}
