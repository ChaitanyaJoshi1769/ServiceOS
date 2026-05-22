/**
 * ServiceOS Core Types
 * Shared type definitions for all ServiceOS packages and services
 */

// ============================================================================
// Identity & Organization
// ============================================================================

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  tier: 'startup' | 'growth' | 'enterprise';
  status: 'active' | 'suspended' | 'deleted';
  settings: OrganizationSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationSettings {
  apiRateLimit: number;
  maxConcurrentWorkflows: number;
  maxAgents: number;
  dataRetentionDays: number;
  complianceLevel: 'basic' | 'regulated' | 'strict';
  allowedDomains?: string[];
  ssoEnabled: boolean;
  auditLoggingEnabled: boolean;
}

export interface User {
  id: string;
  organizationId: string;
  email: string;
  name: string;
  role: 'admin' | 'operator' | 'analyst' | 'viewer';
  status: 'active' | 'inactive' | 'deleted';
  lastLogin?: Date;
  createdAt: Date;
}

// ============================================================================
// Workflows
// ============================================================================

export interface WorkflowDefinition {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  version: number;
  status: 'draft' | 'published' | 'archived';

  // Workflow structure
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
  branches: WorkflowBranch[];
  approvals: ApprovalPolicy[];

  // Configuration
  timeout: number; // milliseconds
  maxRetries: number;
  sla?: ServiceLevelAgreement;
  errorHandling: ErrorHandlingPolicy;

  // Metadata
  tags: string[];
  domain: 'insurance' | 'accounting' | 'healthcare' | 'compliance' | 'general';
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowStep {
  id: string;
  name: string;
  description?: string;
  type: 'task' | 'decision' | 'approval' | 'parallel' | 'loop' | 'subprocess';
  action: StepAction;
  inputs?: Record<string, unknown>;
  outputs?: Record<string, unknown>;
  errorPolicy?: ErrorPolicy;
  timeout?: number;
}

export type StepAction =
  | AgentTask
  | DocumentTask
  | DecisionTask
  | ApprovalTask
  | IntegrationTask;

export interface AgentTask {
  type: 'agent';
  agentRole: string;
  instruction: string;
  tools: string[];
  model?: string;
}

export interface DocumentTask {
  type: 'document';
  operation: 'classify' | 'extract' | 'validate' | 'generate' | 'file';
  documentType?: string;
}

export interface DecisionTask {
  type: 'decision';
  rules: DecisionRule[];
  defaultOutcome?: string;
}

export interface ApprovalTask {
  type: 'approval';
  approvers: string[];
  timeout: number;
  escalationPath?: string[];
}

export interface IntegrationTask {
  type: 'integration';
  system: string; // 'salesforce', 'hubspot', 'quickbooks', etc.
  action: string;
}

export interface WorkflowTrigger {
  id: string;
  type: 'manual' | 'scheduled' | 'event' | 'webhook' | 'api';
  condition?: string;
  config: Record<string, unknown>;
}

export interface WorkflowBranch {
  id: string;
  condition: string;
  steps: WorkflowStep[];
}

export interface ErrorPolicy {
  strategy: 'retry' | 'fallback' | 'escalate' | 'skip' | 'terminate';
  retryDelay?: number;
  maxAttempts?: number;
  fallbackStep?: string;
  escalationPath?: string[];
}

export interface ErrorHandlingPolicy {
  onTimeout: ErrorPolicy;
  onValidationError: ErrorPolicy;
  onAgentFailure: ErrorPolicy;
  onApprovalTimeout: ErrorPolicy;
}

export interface ServiceLevelAgreement {
  type: 'response' | 'completion';
  target: number; // milliseconds
  priority: 'low' | 'medium' | 'high' | 'critical';
}

// ============================================================================
// Workflow Execution
// ============================================================================

export interface WorkflowExecution {
  id: string;
  organizationId: string;
  workflowId: string;
  workflowVersion: number;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';

  // Execution state
  context: ExecutionContext;
  steps: StepExecution[];
  currentStepId?: string;

  // Tracking
  startedAt: Date;
  completedAt?: Date;
  duration?: number;

  // Audit
  createdBy: string;
  triggeredBy: WorkflowTrigger;

  // Results
  output?: Record<string, unknown>;
  errors?: ExecutionError[];
}

export interface ExecutionContext {
  variables: Record<string, unknown>;
  documents: DocumentReference[];
  approvals: ApprovalRecord[];
  decisions: DecisionRecord[];
  metadata: Record<string, unknown>;
}

export interface StepExecution {
  id: string;
  stepId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startedAt?: Date;
  completedAt?: Date;
  attempts: AttemptRecord[];
  output?: Record<string, unknown>;
}

export interface AttemptRecord {
  attemptNumber: number;
  status: 'success' | 'failure';
  startedAt: Date;
  completedAt?: Date;
  error?: string;
  agentId?: string;
  agentResponse?: Record<string, unknown>;
}

export interface ExecutionError {
  stepId: string;
  timestamp: Date;
  code: string;
  message: string;
  context?: Record<string, unknown>;
}

// ============================================================================
// Approval Workflows
// ============================================================================

export interface ApprovalPolicy {
  id: string;
  name: string;
  triggers: ApprovalTrigger[];
  approvers: ApproverRole[];
  timeout: number;
  escalationPath: string[];
  notificationChannels: NotificationChannel[];
}

export type ApprovalTrigger =
  | ThresholdTrigger
  | RuleTrigger
  | RoleTrigger;

export interface ThresholdTrigger {
  type: 'threshold';
  field: string;
  operator: '>' | '<' | '==' | '>=' | '<=';
  value: number;
}

export interface RuleTrigger {
  type: 'rule';
  expression: string;
}

export interface RoleTrigger {
  type: 'role';
  roles: string[];
}

export interface ApproverRole {
  role: string;
  sequentialApproval: boolean;
  minApprovals: number;
}

export interface ApprovalRequest {
  id: string;
  workflowExecutionId: string;
  stepId: string;
  policy: ApprovalPolicy;
  status: 'pending' | 'approved' | 'rejected' | 'expired';

  requestedAt: Date;
  expiresAt: Date;

  approvals: ApprovalRecord[];
  rejectionReason?: string;
}

export interface ApprovalRecord {
  id: string;
  approvalRequestId: string;
  approverId: string;
  status: 'approved' | 'rejected';
  comment?: string;
  decidedAt: Date;
}

export type NotificationChannel = 'email' | 'slack' | 'teams' | 'sms' | 'in-app';

// ============================================================================
// AI Agents
// ============================================================================

export interface AgentDefinition {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  role: string;

  // Capabilities
  capabilities: AgentCapability[];
  tools: ToolDefinition[];
  models: AIModel[];

  // Configuration
  persona?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;

  // Rules
  rules: AgentRule[];
  constraints: AgentConstraint[];

  // Status
  status: 'active' | 'paused' | 'archived';
  version: number;

  createdAt: Date;
  updatedAt: Date;
}

export type AgentCapability =
  | 'task_execution'
  | 'decision_making'
  | 'document_processing'
  | 'customer_interaction'
  | 'compliance_checking'
  | 'knowledge_lookup';

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  authentication?: 'none' | 'api_key' | 'oauth' | 'credentials';
  schema: ToolSchema;
  rateLimit?: number;
}

export interface ToolSchema {
  inputs: ParameterSchema[];
  outputs: ParameterSchema[];
}

export interface ParameterSchema {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description?: string;
  required: boolean;
  default?: unknown;
}

export interface AIModel {
  provider: 'anthropic' | 'openai' | 'google';
  model: string;
  costPerInputToken: number;
  costPerOutputToken: number;
}

export interface AgentRule {
  id: string;
  name: string;
  condition: string;
  action: string;
  priority: number;
}

export interface AgentConstraint {
  type: 'budget' | 'timeout' | 'capability' | 'domain';
  value: string;
}

// ============================================================================
// Agent Execution
// ============================================================================

export interface AgentExecution {
  id: string;
  organizationId: string;
  workflowExecutionId: string;
  stepExecutionId: string;
  agentId: string;

  status: 'assigned' | 'thinking' | 'executing' | 'completed' | 'failed';

  // Task
  instruction: string;
  tools: string[];
  context: AgentContext;

  // Execution
  startedAt: Date;
  completedAt?: Date;

  // Results
  reasoning?: string;
  toolCalls: ToolCall[];
  output?: Record<string, unknown>;

  // Cost tracking
  tokensUsed: {
    input: number;
    output: number;
  };
  costUsd?: number;
}

export interface AgentContext {
  workflowName: string;
  stepName: string;
  previousStepOutputs: Record<string, unknown>;
  workflowContext: ExecutionContext;
  customerInfo?: Record<string, unknown>;
  documentReferences?: DocumentReference[];
}

export interface ToolCall {
  id: string;
  toolName: string;
  inputs: Record<string, unknown>;
  status: 'pending' | 'completed' | 'failed';
  output?: Record<string, unknown>;
  error?: string;
  executedAt?: Date;
  durationMs?: number;
}

// ============================================================================
// Documents
// ============================================================================

export interface Document {
  id: string;
  organizationId: string;
  workflowExecutionId?: string;

  // File metadata
  filename: string;
  mimeType: string;
  size: number;

  // Content
  url: string;
  storagePath: string;

  // Classification
  documentType: string;
  classification: DocumentClassification;

  // Extracted data
  extractedData?: ExtractedData;
  tables?: Table[];
  entities?: NamedEntity[];

  // Processing
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  processingErrors?: string[];

  // Metadata
  uploadedAt: Date;
  processedAt?: Date;
  expiresAt?: Date;
  tags: string[];
}

export interface DocumentClassification {
  primaryType: string;
  confidence: number;
  secondaryTypes?: Array<{ type: string; confidence: number }>;
}

export interface ExtractedData {
  fields: Record<string, unknown>;
  confidence: Record<string, number>;
  sourcePages?: number[];
}

export interface Table {
  id: string;
  title?: string;
  rows: TableRow[];
}

export interface TableRow {
  cells: unknown[];
}

export interface NamedEntity {
  text: string;
  type: string;
  confidence: number;
  startOffset: number;
  endOffset: number;
}

export interface DocumentReference {
  documentId: string;
  filename: string;
  pageNumbers?: number[];
  extractedValue?: unknown;
}

// ============================================================================
// Knowledge Graph
// ============================================================================

export interface KnowledgeGraph {
  id: string;
  organizationId: string;
  domain: string;

  entities: Entity[];
  relationships: Relationship[];
  rules: Rule[];
}

export interface Entity {
  id: string;
  type: string;
  name: string;
  attributes: Record<string, unknown>;
  sourceDocument?: DocumentReference;
}

export interface Relationship {
  id: string;
  sourceEntityId: string;
  targetEntityId: string;
  type: string;
  properties: Record<string, unknown>;
  temporal?: TemporalBound;
}

export interface TemporalBound {
  startDate?: Date;
  endDate?: Date;
  confidence?: number;
}

export interface Rule {
  id: string;
  name: string;
  condition: string; // DSL or SQL-like expression
  consequence: string;
  priority: number;
  domain: string;
}

// ============================================================================
// Memory System
// ============================================================================

export interface OperationalMemory {
  organizationId: string;
  type: 'episodic' | 'semantic' | 'procedural';
  content: unknown;
  embedding?: number[];
  metadata: MemoryMetadata;
  ttl?: number; // seconds
}

export interface MemoryMetadata {
  sourceType: 'workflow' | 'document' | 'decision' | 'agent' | 'user';
  sourceId: string;
  timestamp: Date;
  confidence?: number;
  tags: string[];
}

// ============================================================================
// Compliance & Audit
// ============================================================================

export interface AuditEvent {
  id: string;
  organizationId: string;
  timestamp: Date;

  // Actor
  userId?: string;
  agentId?: string;
  systemInitiated: boolean;

  // Action
  action: string;
  resourceType: string;
  resourceId: string;

  // Details
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  context?: Record<string, unknown>;

  // Compliance
  complianceFramework?: string;
  riskLevel: 'low' | 'medium' | 'high';
  requiresReview: boolean;
}

export interface CompliancePolicy {
  id: string;
  organizationId: string;
  name: string;
  framework: string; // 'HIPAA', 'GDPR', 'SOC2', 'PCI', 'SOX'
  description?: string;

  rules: ComplianceRule[];
  controls: ComplianceControl[];

  status: 'active' | 'inactive';
}

export interface ComplianceRule {
  id: string;
  name: string;
  condition: string;
  action: 'alert' | 'block' | 'audit';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ComplianceControl {
  id: string;
  name: string;
  description?: string;
  testingFrequency: 'continuous' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  evidenceRequired: boolean;
}

export interface ComplianceRecord {
  id: string;
  organizationId: string;
  policyId: string;
  status: 'compliant' | 'non-compliant' | 'pending';
  evidenceDocuments: DocumentReference[];
  testedAt: Date;
  expiresAt: Date;
  remediation?: RemediationPlan;
}

export interface RemediationPlan {
  id: string;
  description: string;
  targetDate: Date;
  status: 'planned' | 'in-progress' | 'completed' | 'overdue';
}

// ============================================================================
// Analytics & Metrics
// ============================================================================

export interface WorkflowMetrics {
  workflowId: string;
  period: MetricsPeriod;

  // Execution metrics
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  successRate: number;

  // Performance metrics
  averageDuration: number; // milliseconds
  p50Duration: number;
  p95Duration: number;
  p99Duration: number;

  // Cost metrics
  totalCostUsd: number;
  costPerExecution: number;

  // Quality metrics
  averageApprovalTime: number;
  averageManualIntervention: number;
  reworkRate: number;
}

export interface MetricsPeriod {
  start: Date;
  end: Date;
  granularity: 'hour' | 'day' | 'week' | 'month';
}

// ============================================================================
// Domain-Specific Types
// ============================================================================

// Insurance
export interface InsurancePolicy {
  id: string;
  policyNumber: string;
  customerName: string;
  coverageType: string;
  premiumAmount: number;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'pending' | 'expired' | 'cancelled';
}

// Accounting
export interface JournalEntry {
  id: string;
  date: Date;
  description: string;
  lines: JournalLine[];
  approved: boolean;
}

export interface JournalLine {
  accountNumber: string;
  debit?: number;
  credit?: number;
}

// Healthcare
export interface PriorAuthorizationRequest {
  id: string;
  patientId: string;
  providerId: string;
  procedureCode: string;
  status: 'pending' | 'approved' | 'denied';
  expiresAt: Date;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: APIError;
  metadata?: Record<string, unknown>;
}

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: Date;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================================
// Webhooks
// ============================================================================

export interface WebhookEvent {
  id: string;
  organizationId: string;
  eventType: string;
  timestamp: Date;
  data: Record<string, unknown>;
}

export interface WebhookSubscription {
  id: string;
  organizationId: string;
  url: string;
  eventTypes: string[];
  active: boolean;
  retryPolicy: RetryPolicy;
}

export interface RetryPolicy {
  maxRetries: number;
  backoffMultiplier: number;
  initialDelayMs: number;
}
