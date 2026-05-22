import { BenchmarkRunner } from '../runner';

async function runDatabaseBenchmarks() {
  const runner = new BenchmarkRunner();

  // Benchmark: Query execution
  await runner.addBenchmark('Database Query', 100, async () => {
    // Simulate database query
    await new Promise(resolve => setTimeout(resolve, 1));
  });

  // Benchmark: Insert operation
  await runner.addBenchmark('Database Insert', 50, async () => {
    // Simulate database insert
    await new Promise(resolve => setTimeout(resolve, 2));
  });

  await runner.saveResults();
}

if (require.main === module) {
  runDatabaseBenchmarks().catch(console.error);
}
