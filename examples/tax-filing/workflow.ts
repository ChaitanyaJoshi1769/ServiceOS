import { WorkflowDefinition } from '@serviceos/types';

export const taxReturnFilingWorkflow: WorkflowDefinition = {
  id: 'tax-return-filing',
  name: 'Tax Return Filing Workflow',
  description: 'End-to-end tax return preparation, calculation, and filing',
  version: '1.0.0',
  steps: [
    {
      id: 'collect_documents',
      type: 'action',
      action: 'collectTaxDocuments',
      input: { taxpayerId: '$.taxpayerId', taxYear: '$.taxYear' },
      description: 'Collect W-2s, 1099s, and other tax documents',
      onSuccess: 'verify_documents'
    },
    {
      id: 'verify_documents',
      type: 'action',
      action: 'verifyDocumentIntegrity',
      input: { documents: '$.collectedDocs' },
      description: 'Verify all documents are authentic and complete',
      onSuccess: 'extract_data'
    },
    {
      id: 'extract_data',
      type: 'action',
      action: 'extractTaxData',
      input: { documents: '$.collectedDocs' },
      description: 'Extract income, deductions, and credits',
      onSuccess: 'calculate_tax'
    },
    {
      id: 'calculate_tax',
      type: 'action',
      action: 'calculateTaxLiability',
      input: {
        income: '$.extractedData.totalIncome',
        deductions: '$.extractedData.deductions',
        credits: '$.extractedData.credits',
        filingStatus: '$.filingStatus'
      },
      description: 'Calculate federal and state tax liability',
      onSuccess: 'optimize_deductions'
    },
    {
      id: 'optimize_deductions',
      type: 'action',
      action: 'identifyAdditionalDeductions',
      input: {
        income: '$.extractedData.totalIncome',
        expenses: '$.extractedData.expenses'
      },
      description: 'Identify additional deductions and tax planning opportunities',
      onSuccess: 'review_calculation'
    },
    {
      id: 'review_calculation',
      type: 'approval',
      assignees: ['tax-professional@company.com'],
      timeout: 72 * 60 * 60 * 1000,
      description: 'Request tax professional to review calculations',
      onApproved: 'prepare_return',
      onRejected: 'recalculate'
    },
    {
      id: 'recalculate',
      type: 'action',
      action: 'recalculateWithFeedback',
      input: { feedback: '$.approvalFeedback' },
      description: 'Recalculate with professional feedback',
      onSuccess: 'review_calculation'
    },
    {
      id: 'prepare_return',
      type: 'action',
      action: 'prepareTaxReturn',
      input: {
        calculation: '$.taxCalculation',
        documents: '$.collectedDocs'
      },
      description: 'Prepare final tax return in IRS format',
      onSuccess: 'e_file'
    },
    {
      id: 'e_file',
      type: 'action',
      action: 'eFileTaxReturn',
      input: { return: '$.preparedReturn' },
      description: 'Submit return to IRS electronically',
      onSuccess: 'confirm_filing'
    },
    {
      id: 'confirm_filing',
      type: 'action',
      action: 'confirmEFileReceipt',
      input: { ackNumber: '$.efileAckNumber' },
      description: 'Confirm successful e-file transmission',
      onSuccess: 'notify_taxpayer'
    },
    {
      id: 'notify_taxpayer',
      type: 'action',
      action: 'sendFilingConfirmation',
      input: {
        email: '$.taxpayerEmail',
        taxYear: '$.taxYear',
        refundAmount: '$.taxCalculation.refund'
      },
      description: 'Send filing confirmation to taxpayer',
      onSuccess: 'complete'
    },
    {
      id: 'complete',
      type: 'terminal'
    }
  ]
};
