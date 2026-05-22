import { BenchmarkResults, BenchmarkConfig } from './types';

export class Benchmark {
  private times: number[] = [];
  private config: BenchmarkConfig;

  constructor(config: BenchmarkConfig) {
    this.config = {
      warmup: 10,
      timeout: 60000,
      ...config
    };
  }

  async run(fn: () => Promise<void>): Promise<BenchmarkResults> {
    // Warmup runs
    for (let i = 0; i < (this.config.warmup || 10); i++) {
      await fn();
    }

    this.times = [];

    // Benchmark runs
    for (let i = 0; i < this.config.iterations; i++) {
      const start = performance.now();
      await fn();
      const end = performance.now();
      this.times.push(end - start);
    }

    return this.calculateResults();
  }

  private calculateResults(): BenchmarkResults {
    const times = this.times.sort((a, b) => a - b);
    const sum = times.reduce((a, b) => a + b, 0);
    const avgTime = sum / times.length;
    const variance = times.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) / times.length;
    const stdDev = Math.sqrt(variance);

    return {
      name: this.config.name,
      iterations: this.config.iterations,
      avgTime: Math.round(avgTime * 100) / 100,
      minTime: Math.round(times[0] * 100) / 100,
      maxTime: Math.round(times[times.length - 1] * 100) / 100,
      stdDev: Math.round(stdDev * 100) / 100,
      throughput: Math.round((1000 / avgTime) * 100) / 100,
      timestamp: new Date()
    };
  }
}
