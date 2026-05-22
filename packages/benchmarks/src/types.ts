export interface BenchmarkResults {
  name: string;
  iterations: number;
  avgTime: number;
  minTime: number;
  maxTime: number;
  stdDev: number;
  throughput: number;
  timestamp: Date;
}

export interface BenchmarkConfig {
  name: string;
  iterations: number;
  warmup?: number;
  timeout?: number;
}
