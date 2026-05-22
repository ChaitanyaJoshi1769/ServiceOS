import { WorkflowEngine } from '@serviceos/workflow-engine';
import { priorAuthorizationWorkflow } from './workflow';

async function runPriorAuth() {
  const engine = new WorkflowEngine();
  await engine.createWorkflow(priorAuthorizationWorkflow);

  const execution = await engine.executeWorkflow('prior-authorization', {
    procedureCode: 'CPT-70553',
    providerNPI: '1234567890',
    insurancePlan: 'BCBS-001',
    diagnosis: 'knee pain',
    providerEmail: 'provider@clinic.com',
    patientEmail: 'patient@email.com'
  });

  execution.on('stepCompleted', (step) => {
    console.log(`✓ ${step.id}`);
  });

  const result = await execution.wait();
  console.log('Prior authorization issued');
  console.log('Authorization number:', result.output.authNumber);
}

runPriorAuth().catch(console.error);
