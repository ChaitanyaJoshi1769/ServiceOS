import { WorkflowEngine } from '@serviceos/workflow-engine';
import { insurancePolicyOnboardingWorkflow } from './workflow';

async function runPolicyOnboarding() {
  const engine = new WorkflowEngine();

  // Register workflow
  await engine.createWorkflow(insurancePolicyOnboardingWorkflow);

  // Execute with sample data
  const execution = await engine.executeWorkflow(
    'insurance-policy-onboarding',
    {
      document: Buffer.from('policy document content'),
      extractedInfo: {
        policyId: 'POL-2024-001',
        policyholderName: 'John Doe',
        address: '123 Main St',
        email: 'john@example.com',
        effectiveDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    }
  );

  // Monitor execution
  execution.on('stepStarted', (step) => {
    console.log(`→ Started: ${step.id} - ${step.description}`);
  });

  execution.on('stepCompleted', (step) => {
    console.log(`✓ Completed: ${step.id} in ${step.duration}ms`);
  });

  execution.on('stepFailed', (step, error) => {
    console.error(`✗ Failed: ${step.id}`, error.message);
  });

  execution.on('complete', (result) => {
    console.log('Workflow completed successfully');
    console.log('Final status:', result.status);
    console.log('Policy issued:', result.output.policyNumber);
  });

  return await execution.wait();
}

// Run example
runPolicyOnboarding().catch(console.error);
