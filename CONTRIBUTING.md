# Contributing to ServiceOS

Thank you for your interest in contributing to ServiceOS! This guide will help you understand how to extend the platform, create plugins, and contribute to the project.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Setup](#development-setup)
3. [Creating Domain Modules](#creating-domain-modules)
4. [Building Plugins](#building-plugins)
5. [Contributing Workflow](#contributing-workflow)
6. [Code Guidelines](#code-guidelines)
7. [Testing](#testing)
8. [Documentation](#documentation)

## Getting Started

### Prerequisites

- Node.js 18+
- TypeScript knowledge
- Familiarity with ServiceOS architecture (see ARCHITECTURE.md)
- Git and GitHub account

### Project Structure

```
ServiceOS/
├── packages/           # Core platform packages
├── apps/              # Applications (API, Web)
├── infrastructure/    # DevOps and deployment
├── docs/             # Documentation
└── examples/         # Example implementations
```

## Development Setup

### Clone and Install

```bash
# Clone repository
git clone https://github.com/ChaitanyaJoshi1769/ServiceOS.git
cd ServiceOS

# Install dependencies
npm install

# Build all packages
npx turbo build

# Start development environment
npm run dev
```

### IDE Setup

#### VS Code
```json
// .vscode/settings.json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "eslint.validate": ["typescript"],
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

#### JetBrains IDEs
1. Enable ESLint: Settings > Languages & Frameworks > JavaScript > Code Quality Tools > ESLint
2. Enable Prettier: Settings > Languages & Frameworks > JavaScript > Prettier
3. Configure TypeScript: Settings > Languages & Frameworks > TypeScript

## Creating Domain Modules

### Structure

Each domain module follows this structure:

```
packages/domains-{industry}/
├── src/
│   ├── index.ts              # Main exports
│   ├── domain-service.ts     # Core service implementation
│   ├── types.ts              # Domain-specific types
│   ├── knowledge-graph.ts    # Domain knowledge integration
│   └── workflows/
│       ├── onboarding.ts
│       ├── processing.ts
│       └── settlement.ts
├── tests/
│   └── domain-service.test.ts
├── package.json
└── tsconfig.json
```

### Example: Creating a Financial Services Domain

```typescript
// packages/domains-financial/src/index.ts
export { FinancialService } from './financial-service';
export { AccountManagement } from './account-management';
export { TransactionProcessor } from './transaction-processor';
export type { Account, Transaction } from './types';

// packages/domains-financial/src/financial-service.ts
import { Logger } from '@serviceos/shared';

const logger = new Logger('FinancialService');

export interface Account {
  id: string;
  accountNumber: string;
  accountType: 'checking' | 'savings' | 'investment';
  balance: number;
  owner: string;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  accountId: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'transfer';
  description: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: Date;
}

export class FinancialService {
  async openAccount(accountType: string, owner: string): Promise<Account> {
    logger.info(`Opening ${accountType} account for ${owner}`);

    const account: Account = {
      id: `acct_${Date.now()}`,
      accountNumber: this.generateAccountNumber(),
      accountType: accountType as Account['accountType'],
      balance: 0,
      owner,
      createdAt: new Date(),
    };

    return account;
  }

  async processTransaction(
    accountId: string,
    amount: number,
    type: 'deposit' | 'withdrawal' | 'transfer',
    description: string
  ): Promise<Transaction> {
    logger.info(`Processing ${type} of $${amount} for account ${accountId}`);

    const transaction: Transaction = {
      id: `txn_${Date.now()}`,
      accountId,
      amount,
      type,
      description,
      status: 'completed',
      timestamp: new Date(),
    };

    return transaction;
  }

  private generateAccountNumber(): string {
    return `${Date.now()}${Math.random().toString().substr(2, 9)}`;
  }
}
```

### Package Configuration

```json
{
  "name": "@serviceos/domains-financial",
  "version": "1.0.0",
  "description": "Financial services domain for ServiceOS",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "lint": "eslint src/**/*.ts"
  },
  "dependencies": {
    "@serviceos/shared": "workspace:*",
    "@serviceos/workflow-engine": "workspace:*",
    "@serviceos/knowledge-graph": "workspace:*"
  },
  "devDependencies": {
    "@types/jest": "^29.5.0",
    "jest": "^29.5.0",
    "typescript": "^5.0.0"
  }
}
```

## Building Plugins

### Plugin Architecture

```
plugins/my-plugin/
├── src/
│   ├── index.ts
│   ├── plugin.ts           # Main plugin class
│   ├── hooks.ts            # Hook implementations
│   └── tools.ts            # Custom tools
├── manifest.json           # Plugin metadata
├── package.json
└── tsconfig.json
```

### Plugin Manifest

```json
{
  "id": "plugin-my-plugin",
  "name": "My Custom Plugin",
  "version": "1.0.0",
  "description": "Custom plugin for ServiceOS",
  "author": "Your Name",
  "license": "MIT",
  "serviceos": {
    "minVersion": "1.0.0",
    "hooks": ["workflow.onStart", "workflow.onComplete"],
    "tools": ["myCustomTool"],
    "permissions": ["read:workflows", "write:approvals"]
  }
}
```

### Example Plugin Implementation

```typescript
// plugins/my-plugin/src/plugin.ts
import { PluginHooks, PluginRegistry } from '@serviceos/plugin-system';

export class MyPlugin {
  constructor(
    private hooks: PluginHooks,
    private registry: PluginRegistry
  ) {}

  async initialize(): Promise<void> {
    // Register hooks
    this.hooks.register('workflow.onStart', this.onWorkflowStart.bind(this));
    this.hooks.register('workflow.onComplete', this.onWorkflowComplete.bind(this));

    // Register custom tools
    this.registry.register('myCustomTool', {
      name: 'MyCustomTool',
      description: 'My custom tool for workflows',
      execute: this.myCustomToolExecute.bind(this),
    });
  }

  private async onWorkflowStart(context: Record<string, unknown>): Promise<void> {
    console.log('Workflow starting:', context);
  }

  private async onWorkflowComplete(context: Record<string, unknown>): Promise<void> {
    console.log('Workflow completed:', context);
  }

  private async myCustomToolExecute(params: Record<string, unknown>): Promise<unknown> {
    // Tool implementation
    return { result: 'success' };
  }
}
```

### Publishing to Plugin Marketplace

```bash
# Build plugin
npm run build

# Package plugin
npm pack

# Register plugin
serviceos plugin register ./my-plugin-1.0.0.tgz \
  --author "Your Name" \
  --description "My custom plugin" \
  --category "integration"

# Verify registration
serviceos plugin list
```

## Contributing Workflow

### 1. Fork and Clone

```bash
# Fork on GitHub, then:
git clone https://github.com/your-username/ServiceOS.git
cd ServiceOS
git remote add upstream https://github.com/ChaitanyaJoshi1769/ServiceOS.git
```

### 2. Create Feature Branch

```bash
# Update main
git fetch upstream
git checkout main
git merge upstream/main

# Create feature branch
git checkout -b feature/your-feature-name
```

### 3. Make Changes

```bash
# Make changes to files
# Follow code guidelines (see below)
# Run tests and linter
npm run test
npm run lint
```

### 4. Commit Changes

```bash
# Use conventional commits
git commit -m "feat: Add new domain module for financial services

- Add FinancialService for account management
- Implement TransactionProcessor for payment handling
- Add integration with KnowledgeGraph for compliance rules

Closes #123"
```

### 5. Push and Create PR

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create pull request on GitHub
# Link to related issues
# Add description and testing notes
```

## Code Guidelines

### TypeScript Standards

```typescript
// ✓ Good: Clear types and documentation
export interface WorkflowDefinition {
  id: string;
  name: string;
  steps: WorkflowStep[];
  createdAt: Date;
}

export class WorkflowService {
  async createWorkflow(definition: WorkflowDefinition): Promise<string> {
    // Implementation
  }
}

// ✗ Bad: Ambiguous types and no documentation
export class WorkflowService {
  createWorkflow(def: any): any {
    // Implementation
  }
}
```

### Error Handling

```typescript
// ✓ Good: Custom error types
export class WorkflowNotFoundError extends Error {
  constructor(workflowId: string) {
    super(`Workflow ${workflowId} not found`);
    this.name = 'WorkflowNotFoundError';
  }
}

// ✗ Bad: Generic errors
if (!workflow) {
  throw new Error('Not found');
}
```

### Logging

```typescript
// ✓ Good: Structured logging with context
logger.info('Workflow started', {
  workflowId: workflow.id,
  steps: workflow.steps.length,
  timeout: workflow.timeout,
});

// ✗ Bad: Unstructured logging
console.log('Workflow started for ' + workflow.id);
```

### Comments

Only add comments for non-obvious logic:

```typescript
// ✓ Good: Explains why, not what
// Exponential backoff with jitter prevents thundering herd
// when multiple workers retry simultaneously
const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;

// ✗ Bad: States the obvious
// Increment attempt
attempt++;
```

## Testing

### Unit Tests

```typescript
// packages/domains-financial/tests/financial-service.test.ts
import { FinancialService } from '../src/financial-service';

describe('FinancialService', () => {
  let service: FinancialService;

  beforeEach(() => {
    service = new FinancialService();
  });

  it('should create an account', async () => {
    const account = await service.openAccount('checking', 'john@example.com');

    expect(account).toBeDefined();
    expect(account.accountType).toBe('checking');
    expect(account.balance).toBe(0);
  });

  it('should process transactions', async () => {
    const account = await service.openAccount('checking', 'john@example.com');

    const transaction = await service.processTransaction(
      account.id,
      1000,
      'deposit',
      'Initial deposit'
    );

    expect(transaction.status).toBe('completed');
    expect(transaction.amount).toBe(1000);
  });
});
```

### Integration Tests

```bash
# Run all tests
npm run test

# Run specific test
npm run test -- --testNamePattern="FinancialService"

# Run with coverage
npm run test -- --coverage
```

## Documentation

### Code Documentation

Every exported function should have JSDoc comments:

```typescript
/**
 * Creates a new workflow and stores it in the database.
 *
 * @param definition - The workflow definition with steps and configuration
 * @returns The ID of the created workflow
 * @throws {ValidationError} If the workflow definition is invalid
 *
 * @example
 * const workflowId = await service.createWorkflow({
 *   id: 'workflow-1',
 *   name: 'Policy Onboarding',
 *   steps: [...]
 * });
 */
export async function createWorkflow(definition: WorkflowDefinition): Promise<string> {
  // Implementation
}
```

### README Guidelines

Each package should have a README.md:

```markdown
# @serviceos/domains-financial

Financial services domain module for ServiceOS.

## Features

- Account management
- Transaction processing
- Balance tracking

## Usage

```typescript
import { FinancialService } from '@serviceos/domains-financial';

const service = new FinancialService();
const account = await service.openAccount('checking', 'user@example.com');
```

## Configuration

Set environment variables:
- `FINANCIAL_API_KEY`: API key for external financial services
- `FINANCIAL_WEBHOOK_URL`: Webhook URL for payment notifications

## License

MIT
```

## Support

- **Issues**: https://github.com/ChaitanyaJoshi1769/ServiceOS/issues
- **Discussions**: https://github.com/ChaitanyaJoshi1769/ServiceOS/discussions
- **Email**: contributors@serviceos.com

---

Thank you for contributing to ServiceOS! 🚀
