import { Database } from './connection';
import { SCHEMAS } from './schemas';
import { Logger } from '@serviceos/shared';

const logger = new Logger('Migrations');

export class Migrations {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async runAll(): Promise<void> {
    logger.info('Starting database migrations...');

    try {
      await this.createMigrationsTable();
      const executed = await this.getExecutedMigrations();

      const migrations = this.getAllMigrations();

      for (const migration of migrations) {
        if (!executed.includes(migration.name)) {
          logger.info(`Executing migration: ${migration.name}`);
          await this.runMigration(migration);
        }
      }

      logger.info('Database migrations completed successfully');
    } catch (error) {
      logger.error('Migration failed', error);
      throw error;
    }
  }

  private async createMigrationsTable(): Promise<void> {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT NOW()
      );
    `);
  }

  private async getExecutedMigrations(): Promise<string[]> {
    const result = await this.db.query('SELECT name FROM migrations ORDER BY executed_at');
    return result.rows.map((row) => row.name);
  }

  private async runMigration(migration: Migration): Promise<void> {
    await this.db.transaction(async (client) => {
      await client.query(migration.sql);
      await client.query('INSERT INTO migrations (name) VALUES ($1)', [migration.name]);
    });
  }

  private getAllMigrations(): Migration[] {
    return [
      {
        name: '001_create_organizations',
        sql: SCHEMAS.organizations,
      },
      {
        name: '002_create_users',
        sql: SCHEMAS.users,
      },
      {
        name: '003_create_workflows',
        sql: SCHEMAS.workflows,
      },
      {
        name: '004_create_workflow_executions',
        sql: SCHEMAS.workflow_executions,
      },
      {
        name: '005_create_agents',
        sql: SCHEMAS.agents,
      },
      {
        name: '006_create_agent_executions',
        sql: SCHEMAS.agent_executions,
      },
      {
        name: '007_create_documents',
        sql: SCHEMAS.documents,
      },
      {
        name: '008_create_approvals',
        sql: SCHEMAS.approvals,
      },
      {
        name: '009_create_approval_records',
        sql: SCHEMAS.approval_records,
      },
      {
        name: '010_create_audit_events',
        sql: SCHEMAS.audit_events,
      },
      {
        name: '011_create_compliance_policies',
        sql: SCHEMAS.compliance_policies,
      },
      {
        name: '012_create_compliance_records',
        sql: SCHEMAS.compliance_records,
      },
      {
        name: '013_create_notifications',
        sql: SCHEMAS.notifications,
      },
      {
        name: '014_create_analytics_events',
        sql: SCHEMAS.analytics_events,
      },
    ];
  }
}

interface Migration {
  name: string;
  sql: string;
}
