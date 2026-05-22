import { BenchmarkRunner } from '../runner';
import { WorkflowEngine } from '@serviceos/workflow-engine';

async function runWorkflowBenchmarks() {
  const runner = new BenchmarkRunner();
  const engine = new WorkflowEngine();

  // Benchmark: Simple workflow creation
  await runner.addBenchmark('Workflow Creation', 100, async () => {
    await engine.createWorkflow({
      id: `wf-${Date.now()}`,
      name: 'Test Workflow',
      steps: [
        { id: 'step1', type: 'action', action: 'test', input: {} }
      ]
    });
  });

  // Benchmark: Workflow execution
  await engine.createWorkflow({
    id: 'bench-workflow',
    name: 'Benchmark',
    steps: [
      { id: 'step1', type: 'action', action: 'test', input: {} }
    ]
  });

  await runner.addBenchmark('Workflow Execution', 50, async () => {
    await engine.executeWorkflow('bench-workflow', {});
  });

  await runner.saveResults();
}

if (require.main === module) {
  runWorkflowBenchmarks().catch(console.error);
}
