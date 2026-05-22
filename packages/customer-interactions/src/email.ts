import { Logger } from '@serviceos/shared';

const logger = new Logger('EmailService');

export interface EmailMessage {
  to: string;
  from?: string;
  subject: string;
  body: string;
  htmlBody?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
  }>;
  cc?: string[];
  bcc?: string[];
  replyTo?: string;
}

export class EmailService {
  private from: string;

  constructor(from: string = process.env.EMAIL_FROM || 'noreply@serviceos.dev') {
    this.from = from;
  }

  async sendEmail(message: EmailMessage): Promise<{ messageId: string; sent: boolean }> {
    logger.info(`Sending email to ${message.to}`, { subject: message.subject });

    try {
      // In production, integrate with email provider (SendGrid, AWS SES, etc.)
      const messageId = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      logger.debug(`Email sent successfully`, {
        messageId,
        to: message.to,
        subject: message.subject,
      });

      return {
        messageId,
        sent: true,
      };
    } catch (error) {
      logger.error(`Failed to send email to ${message.to}`, error);
      return {
        messageId: `error_${Date.now()}`,
        sent: false,
      };
    }
  }

  async sendBatch(messages: EmailMessage[]): Promise<Array<{ messageId: string; sent: boolean }>> {
    logger.info(`Sending batch of ${messages.length} emails`);

    const results = await Promise.all(
      messages.map((msg) => this.sendEmail(msg))
    );

    return results;
  }

  async sendTemplated(
    to: string,
    templateId: string,
    variables: Record<string, unknown>,
    options?: Partial<EmailMessage>
  ): Promise<{ messageId: string; sent: boolean }> {
    logger.info(`Sending templated email to ${to}`, { templateId });

    // In production, load template and render with variables
    const message: EmailMessage = {
      to,
      subject: options?.subject || `Template: ${templateId}`,
      body: options?.body || 'Template email',
      ...options,
    };

    return this.sendEmail(message);
  }

  async sendWorkflowNotification(
    email: string,
    workflowName: string,
    status: string,
    details?: Record<string, unknown>
  ): Promise<{ messageId: string; sent: boolean }> {
    const message: EmailMessage = {
      to: email,
      subject: `Workflow Update: ${workflowName} - ${status}`,
      body: `Your workflow "${workflowName}" has ${status}.${
        details ? '\n\nDetails: ' + JSON.stringify(details, null, 2) : ''
      }`,
    };

    return this.sendEmail(message);
  }

  async sendApprovalRequest(
    email: string,
    approvalId: string,
    approvalName: string
  ): Promise<{ messageId: string; sent: boolean }> {
    const approvalUrl = `${process.env.APP_URL}/approvals/${approvalId}`;

    const message: EmailMessage = {
      to: email,
      subject: `Approval Request: ${approvalName}`,
      body: `You have a pending approval request: ${approvalName}\n\nApprove or reject: ${approvalUrl}`,
      htmlBody: `
        <h2>Approval Request</h2>
        <p><strong>${approvalName}</strong></p>
        <p>
          <a href="${approvalUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Review Approval
          </a>
        </p>
      `,
    };

    return this.sendEmail(message);
  }
}
