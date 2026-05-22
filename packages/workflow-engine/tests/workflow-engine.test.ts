import { WorkflowEngine } from '../src/index';

describe('WorkflowEngine', () => {
  let engine: WorkflowEngine;

  beforeEach(() => {
    engine = new WorkflowEngine();
  });

  describe('createWorkflow', () => {
    it('should create a workflow with valid definition', async () => {
      const workflow = await engine.createWorkflow({
        id: 'test-wf',
        name: 'Test Workflow',
        steps: [
          { id: 'step1', type: 'action', action: 'test', input: {} }
        ]
      });

      expect(workflow).toBeDefined();
      expect(workflow.id).toBe('test-wf');
    });
  });

  describe('executeWorkflow', () => {
    it('should execute single step workflow', async () => {
      await engine.createWorkflow({
        id: 'simple-wf',
        name: 'Simple',
        steps: [
          { id: 'step1', type: 'action', action: 'test', input: {} }
        ]
      });

      const execution = await engine.executeWorkflow('simple-wf', {});
      expect(execution.status).toBe('completed');
    });

    it('should handle workflow with branching', async () => {
      await engine.createWorkflow({
        id: 'branch-wf',
        name: 'Branching',
        steps: [
          {
            id: 'check',
            type: 'branch',
            condition: 'value > 100',
            branches: { true: 'high', false: 'low' }
          },
          {
            id: 'high',
            type: 'action',
            action: 'processHigh',
            input: {}
          },
          {
            id: 'low',
            type: 'action',
            action: 'processLow',
            input: {}
          }
        ]
      });

      const execution = await engine.executeWorkflow('branch-wf', { value: 150 });
      expect(execution.status).toBe('completed');
    });

    it('should retry failed steps', async () => {
      await engine.createWorkflow({
        id: 'retry-wf',
        name: 'Retry',
        steps: [
          {
            id: 'step1',
            type: 'action',
            action: 'flaky',
            input: {},
            retry: { maxAttempts: 3, delayMs: 100 }
          }
        ]
      });

      const execution = await engine.executeWorkflow('retry-wf', {});
      expect(execution.steps[0].attempts).toBeLessThanOrEqual(3);
    });
  });
});
