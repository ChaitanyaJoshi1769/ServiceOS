import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Logger } from '@serviceos/shared';

// Load environment variables
dotenv.config();

const app: Express = express();
const logger = new Logger('ServiceOS API');
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.path}`, {
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
  });
  next();
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
  });
});

// API version endpoint
app.get('/api/v1', (req: Request, res: Response) => {
  res.json({
    message: 'ServiceOS API v1',
    endpoints: {
      workflows: '/api/v1/workflows',
      agents: '/api/v1/agents',
      documents: '/api/v1/documents',
      compliance: '/api/v1/compliance',
      audit: '/api/v1/audit',
    },
  });
});

// Workflow endpoints
app.get('/api/v1/workflows', (req: Request, res: Response) => {
  res.json({
    workflows: [],
    total: 0,
    page: 1,
    pageSize: 10,
  });
});

app.post('/api/v1/workflows', (req: Request, res: Response) => {
  const { name, description, steps } = req.body;

  res.status(201).json({
    id: `wf_${Date.now()}`,
    name,
    description,
    steps: steps || [],
    status: 'draft',
    version: 1,
    createdAt: new Date().toISOString(),
  });
});

app.get('/api/v1/workflows/:id', (req: Request, res: Response) => {
  res.json({
    id: req.params.id,
    name: 'Example Workflow',
    description: 'An example workflow',
    status: 'published',
    version: 1,
  });
});

app.post('/api/v1/workflows/:id/execute', (req: Request, res: Response) => {
  res.status(202).json({
    executionId: `exec_${Date.now()}`,
    workflowId: req.params.id,
    status: 'running',
    startedAt: new Date().toISOString(),
  });
});

// Agent endpoints
app.get('/api/v1/agents', (req: Request, res: Response) => {
  res.json({
    agents: [],
    total: 0,
  });
});

app.post('/api/v1/agents', (req: Request, res: Response) => {
  const { name, role, capabilities } = req.body;

  res.status(201).json({
    id: `agent_${Date.now()}`,
    name,
    role,
    capabilities: capabilities || [],
    status: 'active',
    createdAt: new Date().toISOString(),
  });
});

app.post('/api/v1/agents/:id/execute', (req: Request, res: Response) => {
  const { instruction, context } = req.body;

  res.status(202).json({
    executionId: `agent_exec_${Date.now()}`,
    agentId: req.params.id,
    instruction,
    status: 'running',
    startedAt: new Date().toISOString(),
  });
});

// Document endpoints
app.get('/api/v1/documents', (req: Request, res: Response) => {
  res.json({
    documents: [],
    total: 0,
  });
});

app.post('/api/v1/documents', (req: Request, res: Response) => {
  res.status(201).json({
    id: `doc_${Date.now()}`,
    filename: req.body.filename || 'document',
    status: 'pending',
    processingStatus: 'pending',
    uploadedAt: new Date().toISOString(),
  });
});

// Compliance endpoints
app.get('/api/v1/compliance/status', (req: Request, res: Response) => {
  res.json({
    compliant: 85,
    nonCompliant: 15,
    total: 100,
    lastAssessment: new Date().toISOString(),
  });
});

app.get('/api/v1/audit/events', (req: Request, res: Response) => {
  const { limit = 10, offset = 0 } = req.query;

  res.json({
    events: [],
    total: 0,
    limit: Number(limit),
    offset: Number(offset),
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', err);

  res.status(err.statusCode || 500).json({
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'An internal error occurred',
      timestamp: new Date().toISOString(),
    },
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
      timestamp: new Date().toISOString(),
    },
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`ServiceOS API server running on port ${PORT}`);
  logger.info(`API documentation available at http://localhost:${PORT}/api/v1`);
});

export default app;
