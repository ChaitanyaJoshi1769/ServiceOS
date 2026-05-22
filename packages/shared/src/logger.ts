export enum LogLevel {
  Debug = 'DEBUG',
  Info = 'INFO',
  Warn = 'WARN',
  Error = 'ERROR',
}

export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  debug(message: string, data?: unknown): void {
    this.log(LogLevel.Debug, message, data);
  }

  info(message: string, data?: unknown): void {
    this.log(LogLevel.Info, message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log(LogLevel.Warn, message, data);
  }

  error(message: string, error?: unknown): void {
    this.log(LogLevel.Error, message, error);
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      context: this.context,
      message,
      data,
    };

    // In production, send to centralized logging service
    console.log(JSON.stringify(logEntry));
  }
}
