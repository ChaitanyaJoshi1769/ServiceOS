export interface AppError extends Error {
  code: string;
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
}
