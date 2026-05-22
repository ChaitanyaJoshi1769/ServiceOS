import axios, { AxiosInstance } from 'axios';

export interface ClientConfig {
  apiKey: string;
  baseURL?: string;
  timeout?: number;
}

export class ServiceOSClient {
  private client: AxiosInstance;

  constructor(config: ClientConfig) {
    this.client = axios.create({
      baseURL: config.baseURL || 'https://api.serviceos.com/v1',
      timeout: config.timeout || 30000,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  // Workflows
  async createWorkflow(definition: Record<string, unknown>) {
    const response = await this.client.post('/workflows', definition);
    return response.data;
  }

  async getWorkflow(workflowId: string) {
    const response = await this.client.get(`/workflows/${workflowId}`);
    return response.data;
  }

  async listWorkflows(limit = 20, offset = 0) {
    const response = await this.client.get('/workflows', {
      params: { limit, offset }
    });
    return response.data;
  }

  async executeWorkflow(workflowId: string, input: Record<string, unknown>) {
    const response = await this.client.post(`/workflows/${workflowId}/execute`, { input });
    return response.data;
  }

  // Executions
  async getExecution(executionId: string) {
    const response = await this.client.get(`/executions/${executionId}`);
    return response.data;
  }

  async cancelExecution(executionId: string) {
    const response = await this.client.post(`/executions/${executionId}/cancel`);
    return response.data;
  }

  // Agents
  async registerAgent(config: Record<string, unknown>) {
    const response = await this.client.post('/agents', config);
    return response.data;
  }

  async getAgent(agentId: string) {
    const response = await this.client.get(`/agents/${agentId}`);
    return response.data;
  }

  async assignTask(agentId: string, task: Record<string, unknown>) {
    const response = await this.client.post(`/agents/${agentId}/tasks`, task);
    return response.data;
  }

  // Approvals
  async createApproval(request: Record<string, unknown>) {
    const response = await this.client.post('/approvals', request);
    return response.data;
  }

  async getApproval(approvalId: string) {
    const response = await this.client.get(`/approvals/${approvalId}`);
    return response.data;
  }

  async submitDecision(approvalId: string, decision: Record<string, unknown>) {
    const response = await this.client.post(`/approvals/${approvalId}/decide`, decision);
    return response.data;
  }

  // Documents
  async uploadDocument(file: Buffer, metadata: Record<string, unknown>) {
    const formData = new FormData();
    formData.append('file', new Blob([file]));
    formData.append('metadata', JSON.stringify(metadata));

    const response = await this.client.post('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  async extractFromDocument(documentId: string, fields: string[]) {
    const response = await this.client.post(`/documents/${documentId}/extract`, {
      fields,
      extractionType: 'structured'
    });
    return response.data;
  }

  // Compliance & Analytics
  async getAuditEvents(organizationId: string, options: Record<string, unknown> = {}) {
    const response = await this.client.get('/audit/events', {
      params: { organizationId, ...options }
    });
    return response.data;
  }

  async getComplianceStatus(organizationId: string) {
    const response = await this.client.get('/compliance/status', {
      params: { organizationId }
    });
    return response.data;
  }

  async getDashboard(organizationId: string, options: Record<string, unknown> = {}) {
    const response = await this.client.get('/analytics/dashboard', {
      params: { organizationId, ...options }
    });
    return response.data;
  }
}
