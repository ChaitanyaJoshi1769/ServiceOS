import { WorkflowDefinition } from '@serviceos/types';

export const priorAuthorizationWorkflow: WorkflowDefinition = {
  id: 'prior-authorization',
  name: 'Healthcare Prior Authorization',
  description: 'Complete prior authorization request workflow',
  version: '1.0.0',
  steps: [
    {
      id: 'validate_request',
      type: 'action',
      action: 'validatePriorAuthRequest',
      input: {
        procedureCode: '$.procedureCode',
        providerNPI: '$.providerNPI',
        insurancePlan: '$.insurancePlan'
      },
      description: 'Validate prior auth request structure',
      onSuccess: 'verify_coverage',
      onFailure: 'reject_invalid'
    },
    {
      id: 'verify_coverage',
      type: 'action',
      action: 'verifyCoverage',
      input: {
        insurancePlan: '$.insurancePlan',
        procedureCode: '$.procedureCode'
      },
      description: 'Verify procedure is covered under plan',
      onSuccess: 'check_medical_necessity'
    },
    {
      id: 'check_medical_necessity',
      type: 'action',
      action: 'assessMedicalNecessity',
      input: {
        diagnosis: '$.diagnosis',
        procedureCode: '$.procedureCode',
        patientHistory: '$.patientHistory'
      },
      description: 'Assess medical necessity based on clinical guidelines',
      onSuccess: 'review_by_clinician'
    },
    {
      id: 'review_by_clinician',
      type: 'approval',
      assignees: ['medical-reviewer@insurance.com'],
      timeout: 48 * 60 * 60 * 1000,
      description: 'Medical reviewer assesses clinical appropriateness',
      onApproved: 'issue_authorization',
      onRejected: 'request_appeal_docs'
    },
    {
      id: 'request_appeal_docs',
      type: 'action',
      action: 'requestAdditionalDocumentation',
      input: {
        requestId: '$.requestId',
        providerEmail: '$.providerEmail'
      },
      description: 'Request additional documentation for review',
      onSuccess: 'wait_for_docs'
    },
    {
      id: 'wait_for_docs',
      type: 'action',
      action: 'monitorDocumentReceipt',
      input: { timeout: 10 * 24 * 60 * 60 * 1000 },
      description: 'Wait for provider to submit additional docs (10 days)',
      onSuccess: 'check_medical_necessity'
    },
    {
      id: 'issue_authorization',
      type: 'action',
      action: 'issueAuthorizationNumber',
      input: {
        procedureCode: '$.procedureCode',
        authDuration: '$.authDuration'
      },
      description: 'Issue authorization number',
      onSuccess: 'notify_provider'
    },
    {
      id: 'notify_provider',
      type: 'action',
      action: 'sendAuthorizationToProvider',
      input: {
        providerEmail: '$.providerEmail',
        authNumber: '$.authNumber'
      },
      description: 'Notify provider of authorization',
      onSuccess: 'notify_patient'
    },
    {
      id: 'notify_patient',
      type: 'action',
      action: 'sendAuthorizationToPatient',
      input: {
        patientEmail: '$.patientEmail',
        authNumber: '$.authNumber'
      },
      description: 'Notify patient of authorization',
      onSuccess: 'complete'
    },
    {
      id: 'reject_invalid',
      type: 'action',
      action: 'rejectInvalidRequest',
      description: 'Reject invalid request'
    },
    {
      id: 'complete',
      type: 'terminal'
    }
  ]
};
