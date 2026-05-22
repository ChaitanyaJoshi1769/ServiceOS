import { Pool, Client } from 'pg';
import { Logger } from '@serviceos/shared';

const logger = new Logger('Database');

export class Database {
  private pool: Pool;
  private static instance: Database;

  private constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    this.pool.on('error', (err) => {
      logger.error('Unexpected error on idle client', err);
    });
  }

  static getInstance(connectionString: string = process.env.DATABASE_URL || ''): Database {
    if (!Database.instance) {
      Database.instance = new Database(connectionString);
    }
    return Database.instance;
  }

  async query(text: string, values?: unknown[]): Promise<any> {
    const start = Date.now();
    try {
      const result = await this.pool.query(text, values);
      const duration = Date.now() - start;
      logger.debug(`Query executed in ${duration}ms`, { text, rows: result.rowCount });
      return result;
    } catch (error) {
      logger.error('Database query failed', error);
      throw error;
    }
  }

  async transaction<T>(callback: (client: Client) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
    logger.info('Database connection pool closed');
  }

  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.query('SELECT NOW()');
      return result.rows.length > 0;
    } catch {
      return false;
    }
  }
}
