import { Agent, AgentOrchestrator, ToolRegistry } from '../src/index';

describe('Agent', () => {
  let toolRegistry: ToolRegistry;

  beforeEach(() => {
    toolRegistry = new ToolRegistry();
  });

  it('should create agent with tools', async () => {
    const agent = new Agent({
      name: 'TestAgent',
      description: 'Test',
      systemPrompt: 'Test prompt',
      tools: toolRegistry,
      model: 'claude-3-opus'
    });

    expect(agent.name).toBe('TestAgent');
  });

  it('should execute agent task', async () => {
    const agent = new Agent({
      name: 'TestAgent',
      description: 'Test',
      systemPrompt: 'You are helpful',
      tools: toolRegistry,
      model: 'claude-3-opus'
    });

    const result = await agent.execute({
      task: 'Respond with hello',
      documents: []
    });

    expect(result).toBeDefined();
    expect(result.output).toBeDefined();
  });
});

describe('ToolRegistry', () => {
  let registry: ToolRegistry;

  beforeEach(() => {
    registry = new ToolRegistry();
  });

  it('should register tools', () => {
    registry.register({
      name: 'calculator',
      description: 'Calc',
      parameters: { type: 'object', properties: {} },
      execute: async () => 42
    });

    const tool = registry.getTool('calculator');
    expect(tool?.name).toBe('calculator');
  });

  it('should list all tools', () => {
    registry.register({
      name: 'tool1',
      description: 'T1',
      parameters: { type: 'object', properties: {} },
      execute: async () => ({})
    });

    registry.register({
      name: 'tool2',
      description: 'T2',
      parameters: { type: 'object', properties: {} },
      execute: async () => ({})
    });

    const tools = registry.listTools();
    expect(tools.length).toBe(2);
  });
});

describe('AgentOrchestrator', () => {
  let orchestrator: AgentOrchestrator;

  beforeEach(() => {
    orchestrator = new AgentOrchestrator();
  });

  it('should register agents', async () => {
    const agent = new Agent({
      name: 'Agent1',
      description: 'First',
      systemPrompt: 'Prompt1',
      tools: new ToolRegistry(),
      model: 'claude-3-opus'
    });

    await orchestrator.registerAgent(agent);
    const retrieved = await orchestrator.getAgent('Agent1');

    expect(retrieved?.name).toBe('Agent1');
  });

  it('should coordinate multiple agents', async () => {
    const agent1 = new Agent({
      name: 'Agent1',
      description: 'First',
      systemPrompt: 'P1',
      tools: new ToolRegistry(),
      model: 'claude-3-opus'
    });

    const agent2 = new Agent({
      name: 'Agent2',
      description: 'Second',
      systemPrompt: 'P2',
      tools: new ToolRegistry(),
      model: 'claude-3-opus'
    });

    await orchestrator.registerAgent(agent1);
    await orchestrator.registerAgent(agent2);

    const result = await orchestrator.coordinateAgents(
      ['Agent1', 'Agent2'],
      'Task'
    );

    expect(result.status).toBe('completed');
  });
});
