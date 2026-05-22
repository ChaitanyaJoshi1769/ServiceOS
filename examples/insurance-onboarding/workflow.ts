import { WorkflowDefinition } from '@serviceos/types';

export const insurancePolicyOnboardingWorkflow: WorkflowDefinition = {
  id: 'insurance-policy-onboarding',
  name: 'Insurance Policy Onboarding',
  description: 'Complete workflow for onboarding new insurance policies',
  version: '1.0.0',
  steps: [
    {
      id: 'validate_policy',
      type: 'action',
      action: 'validatePolicy',
      input: { policyDocument: '$.document' },
      description: 'Validate policy document format and required fields',
      onSuccess: 'extract_info',
      onFailure: 'reject_policy'
    },
    {
      id: 'extract_info',
      type: 'action',
      action: 'extractPolicyInfo',
      input: { document: '$.document' },
      description: 'Extract key information from policy',
      onSuccess: 'perform_kyc'
    },
    {
      id: 'perform_kyc',
      type: 'action',
      action: 'performKYC',
      input: {
        customerName: '$.extractedInfo.policyholderName',
        address: '$.extractedInfo.address'
      },
      description: 'Perform Know Your Customer verification',
      onSuccess: 'risk_assessment'
    },
    {
      id: 'risk_assessment',
      type: 'action',
      action: 'assessRisk',
      input: { policyDetails: '$.extractedInfo' },
      description: 'Assess risk based on policy details',
      onSuccess: 'approval_check'
    },
    {
      id: 'approval_check',
      type: 'branch',
      condition: 'riskScore < 70 && kycStatus === "approved"',
      branches: {
        true: 'auto_approve',
        false: 'request_approval'
      }
    },
    {
      id: 'auto_approve',
      type: 'action',
      action: 'approvePolicyAuto',
      input: { policyId: '$.extractedInfo.policyId' },
      onSuccess: 'issue_policy'
    },
    {
      id: 'request_approval',
      type: 'approval',
      assignees: ['underwriter@insurance.com'],
      timeout: 24 * 60 * 60 * 1000,
      description: 'Request manual approval from underwriter',
      onApproved: 'issue_policy',
      onRejected: 'reject_policy'
    },
    {
      id: 'issue_policy',
      type: 'action',
      action: 'issuePolicy',
      input: {
        policyId: '$.extractedInfo.policyId',
        effectiveDate: '$.extractedInfo.effectiveDate'
      },
      description: 'Issue the policy',
      onSuccess: 'send_confirmation'
    },
    {
      id: 'send_confirmation',
      type: 'action',
      action: 'sendPolicyConfirmation',
      input: {
        email: '$.extractedInfo.email',
        policyNumber: '$.issuedPolicy.number'
      },
      description: 'Send confirmation to customer',
      onSuccess: 'complete'
    },
    {
      id: 'reject_policy',
      type: 'action',
      action: 'rejectPolicy',
      input: {
        policyId: '$.extractedInfo.policyId',
        reason: '$.validationError || "Risk assessment failed"'
      },
      description: 'Reject the policy',
      onSuccess: 'send_rejection'
    },
    {
      id: 'send_rejection',
      type: 'action',
      action: 'sendRejectionNotice',
      input: { email: '$.extractedInfo.email' },
      description: 'Notify customer of rejection',
      onSuccess: 'complete'
    },
    {
      id: 'complete',
      type: 'terminal',
      description: 'Workflow complete'
    }
  ]
};
