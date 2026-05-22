import { Benchmark } from './benchmark';
import { BenchmarkResults } from './types';
import * as fs from 'fs';
import * as path from 'path';

export class BenchmarkRunner {
  private results: BenchmarkResults[] = [];

  async addBenchmark(name: string, iterations: number, fn: () => Promise<void>): Promise<void> {
    const benchmark = new Benchmark({ name, iterations });
    const result = await benchmark.run(fn);
    this.results.push(result);
    this.printResult(result);
  }

  private printResult(result: BenchmarkResults): void {
    console.log(`\n${result.name}`);
    console.log(`  Iterations: ${result.iterations}`);
    console.log(`  Avg Time: ${result.avgTime}ms`);
    console.log(`  Min Time: ${result.minTime}ms`);
    console.log(`  Max Time: ${result.maxTime}ms`);
    console.log(`  Std Dev: ${result.stdDev}ms`);
    console.log(`  Throughput: ${result.throughput} ops/sec`);
  }

  async saveResults(filename: string = 'benchmark-results.json'): Promise<void> {
    const output = {
      timestamp: new Date(),
      benchmarks: this.results
    };

    fs.writeFileSync(
      path.join(process.cwd(), filename),
      JSON.stringify(output, null, 2)
    );

    console.log(`\nResults saved to ${filename}`);
  }

  compareWithPrevious(previousFile: string): void {
    if (!fs.existsSync(previousFile)) {
      console.log('No previous results to compare');
      return;
    }

    const previous = JSON.parse(fs.readFileSync(previousFile, 'utf-8'));
    console.log('\n--- Performance Comparison ---');

    for (const current of this.results) {
      const prev = previous.benchmarks.find((b: BenchmarkResults) => b.name === current.name);
      if (!prev) continue;

      const improvement = ((prev.avgTime - current.avgTime) / prev.avgTime * 100).toFixed(2);
      const symbol = parseFloat(improvement) > 0 ? '✓' : '✗';
      console.log(`${symbol} ${current.name}: ${improvement}% ${parseFloat(improvement) > 0 ? 'faster' : 'slower'}`);
    }
  }
}
