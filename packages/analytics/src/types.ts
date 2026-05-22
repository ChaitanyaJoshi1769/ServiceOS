export interface Metric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
}

export interface MetricsAggregation {
  min: number;
  max: number;
  avg: number;
  p50: number;
  p95: number;
  p99: number;
}
