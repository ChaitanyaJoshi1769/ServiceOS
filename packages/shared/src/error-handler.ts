import { AppError } from './types';

export class ErrorHandler {
  static handle(error: unknown): AppError {
    if (error instanceof Error && 'code' in error) {
      return error as AppError;
    }

    if (error instanceof Error) {
      return {
        code: 'INTERNAL_ERROR',
        message: error.message,
        statusCode: 500,
        details: { originalError: error.stack },
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: String(error),
      statusCode: 500,
    };
  }

  static createError(
    code: string,
    message: string,
    statusCode: number = 400,
    details?: Record<string, unknown>
  ): AppError {
    return { code, message, statusCode, details };
  }
}
