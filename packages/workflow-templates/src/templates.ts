import { WorkflowDefinition } from '@serviceos/types';

export const approvalWorkflowTemplate: WorkflowDefinition = {
  id: 'approval-template',
  name: 'Approval Workflow',
  description: 'Standard multi-level approval workflow',
  version: '1.0.0',
  steps: [
    {
      id: 'initial_review',
      type: 'approval',
      assignees: ['$.reviewers.primary'],
      timeout: 24 * 60 * 60 * 1000,
      description: 'Initial review and approval',
      onApproved: 'final_approval',
      onRejected: 'rejection_notification'
    },
    {
      id: 'final_approval',
      type: 'approval',
      assignees: ['$.reviewers.final'],
      timeout: 24 * 60 * 60 * 1000,
      description: 'Final approval',
      onApproved: 'approval_complete',
      onRejected: 'rejection_notification'
    },
    {
      id: 'rejection_notification',
      type: 'action',
      action: 'notifyRejection',
      input: { email: '$.requestor.email' }
    },
    {
      id: 'approval_complete',
      type: 'action',
      action: 'notifyApproval',
      input: { email: '$.requestor.email' }
    }
  ]
};

export const notificationWorkflowTemplate: WorkflowDefinition = {
  id: 'notification-template',
  name: 'Multi-Channel Notification',
  description: 'Send notifications across multiple channels',
  version: '1.0.0',
  steps: [
    {
      id: 'send_email',
      type: 'action',
      action: 'sendEmail',
      input: {
        to: '$.recipient.email',
        subject: '$.notification.subject',
        body: '$.notification.body'
      }
    },
    {
      id: 'send_sms',
      type: 'action',
      action: 'sendSMS',
      input: {
        phone: '$.recipient.phone',
        message: '$.notification.smsText'
      }
    },
    {
      id: 'send_slack',
      type: 'action',
      action: 'sendSlack',
      input: {
        channel: '$.recipient.slackChannel',
        message: '$.notification.slackText'
      }
    },
    {
      id: 'log_notification',
      type: 'action',
      action: 'logNotification',
      input: {
        recipientId: '$.recipient.id',
        channels: ['email', 'sms', 'slack']
      }
    }
  ]
};

export const dataProcessingWorkflowTemplate: WorkflowDefinition = {
  id: 'data-processing-template',
  name: 'Data Processing Pipeline',
  description: 'Extract, transform, and validate data',
  version: '1.0.0',
  steps: [
    {
      id: 'extract',
      type: 'action',
      action: 'extractData',
      input: { source: '$.dataSource' },
      onSuccess: 'transform'
    },
    {
      id: 'transform',
      type: 'action',
      action: 'transformData',
      input: { rawData: '$.extractedData' },
      onSuccess: 'validate'
    },
    {
      id: 'validate',
      type: 'action',
      action: 'validateData',
      input: { data: '$.transformedData' },
      onSuccess: 'quality_check',
      onFailure: 'handle_error'
    },
    {
      id: 'quality_check',
      type: 'branch',
      condition: 'dataQuality > 0.95',
      branches: {
        true: 'load',
        false: 'request_review'
      }
    },
    {
      id: 'request_review',
      type: 'approval',
      assignees: ['$.qualityReviewers'],
      timeout: 48 * 60 * 60 * 1000,
      onApproved: 'load',
      onRejected: 'handle_error'
    },
    {
      id: 'load',
      type: 'action',
      action: 'loadData',
      input: { destination: '$.destination', data: '$.validatedData' }
    },
    {
      id: 'handle_error',
      type: 'action',
      action: 'handleError',
      input: { error: '$.error' }
    }
  ]
};

export const escalationWorkflowTemplate: WorkflowDefinition = {
  id: 'escalation-template',
  name: 'Issue Escalation',
  description: 'Escalate issues through management chain',
  version: '1.0.0',
  steps: [
    {
      id: 'level_1_support',
      type: 'approval',
      assignees: ['$.support.level1'],
      timeout: 2 * 60 * 60 * 1000,
      description: 'Level 1 support review',
      onApproved: 'resolved',
      onRejected: 'level_2_escalation'
    },
    {
      id: 'level_2_escalation',
      type: 'approval',
      assignees: ['$.support.level2'],
      timeout: 4 * 60 * 60 * 1000,
      description: 'Level 2 escalation',
      onApproved: 'resolved',
      onRejected: 'level_3_escalation'
    },
    {
      id: 'level_3_escalation',
      type: 'approval',
      assignees: ['$.support.level3'],
      timeout: 8 * 60 * 60 * 1000,
      description: 'Level 3 executive escalation',
      onApproved: 'resolved'
    },
    {
      id: 'resolved',
      type: 'action',
      action: 'notifyResolution',
      input: { customerId: '$.customerId' }
    }
  ]
};
