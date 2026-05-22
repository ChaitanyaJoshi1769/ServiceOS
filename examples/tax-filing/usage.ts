import { WorkflowEngine } from '@serviceos/workflow-engine';
import { taxReturnFilingWorkflow } from './workflow';

async function runTaxFiling() {
  const engine = new WorkflowEngine();
  await engine.createWorkflow(taxReturnFilingWorkflow);

  const execution = await engine.executeWorkflow('tax-return-filing', {
    taxpayerId: 'TP-2024-001',
    taxYear: 2023,
    filingStatus: 'single',
    taxpayerEmail: 'john@example.com'
  });

  execution.on('stepCompleted', (step) => {
    console.log(`✓ ${step.id}`);
  });

  const result = await execution.wait();
  console.log('Tax return filed successfully');
  console.log('Expected refund:', result.output.refundAmount);
}

runTaxFiling().catch(console.error);
