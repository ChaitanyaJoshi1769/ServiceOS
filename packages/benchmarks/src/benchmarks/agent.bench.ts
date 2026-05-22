import { BenchmarkRunner } from '../runner';
import { Agent, ToolRegistry } from '@serviceos/agent-core';

async function runAgentBenchmarks() {
  const runner = new BenchmarkRunner();
  const toolRegistry = new ToolRegistry();

  const agent = new Agent({
    name: 'BenchAgent',
    description: 'Benchmark agent',
    systemPrompt: 'You are helpful',
    tools: toolRegistry,
    model: 'claude-3-opus'
  });

  await runner.addBenchmark('Agent Task Execution', 20, async () => {
    await agent.execute({
      task: 'Count to 5',
      documents: []
    });
  });

  await runner.saveResults();
}

if (require.main === module) {
  runAgentBenchmarks().catch(console.error);
}
