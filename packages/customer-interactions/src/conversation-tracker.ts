import { Logger } from '@serviceos/shared';

const logger = new Logger('ConversationTracker');

export interface Conversation {
  id: string;
  customerId: string;
  channel: string;
  messages: Array<{
    timestamp: Date;
    sender: string;
    content: string;
    sentiment?: 'positive' | 'neutral' | 'negative';
  }>;
  status: 'active' | 'closed' | 'escalated';
  startedAt: Date;
  endedAt?: Date;
  agentId?: string;
  resolution?: string;
  satisfaction?: number;
}

export class ConversationTracker {
  private conversations: Map<string, Conversation>;

  constructor() {
    this.conversations = new Map();
  }

  async createConversation(
    customerId: string,
    channel: string,
    agentId?: string
  ): Promise<Conversation> {
    logger.info(`Creating conversation for customer ${customerId} on ${channel}`);

    const conversation: Conversation = {
      id: `conv_${Date.now()}`,
      customerId,
      channel,
      messages: [],
      status: 'active',
      startedAt: new Date(),
      agentId,
    };

    this.conversations.set(conversation.id, conversation);
    return conversation;
  }

  async addMessage(
    conversationId: string,
    sender: string,
    content: string,
    sentiment?: 'positive' | 'neutral' | 'negative'
  ): Promise<void> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      logger.warn(`Conversation ${conversationId} not found`);
      return;
    }

    conversation.messages.push({
      timestamp: new Date(),
      sender,
      content,
      sentiment,
    });

    logger.debug(`Added message to conversation ${conversationId}`, {
      sender,
      length: content.length,
    });
  }

  async closeConversation(
    conversationId: string,
    resolution?: string,
    satisfaction?: number
  ): Promise<void> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      return;
    }

    logger.info(`Closing conversation ${conversationId}`, { satisfaction });

    conversation.status = 'closed';
    conversation.endedAt = new Date();
    conversation.resolution = resolution;
    conversation.satisfaction = satisfaction;
  }

  async escalateConversation(conversationId: string): Promise<void> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      return;
    }

    logger.warn(`Escalating conversation ${conversationId}`);

    conversation.status = 'escalated';
  }

  async getConversation(id: string): Promise<Conversation | null> {
    return this.conversations.get(id) || null;
  }

  async getCustomerConversations(customerId: string): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).filter(
      (c) => c.customerId === customerId
    );
  }

  async getConversationSummary(conversationId: string): Promise<{
    duration: number;
    messageCount: number;
    lastMessage?: string;
    avgSentiment?: string;
  }> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      return {
        duration: 0,
        messageCount: 0,
      };
    }

    const duration = conversation.endedAt
      ? conversation.endedAt.getTime() - conversation.startedAt.getTime()
      : Date.now() - conversation.startedAt.getTime();

    const messages = conversation.messages;
    const lastMessage = messages[messages.length - 1]?.content;

    const sentiments = messages.filter((m) => m.sentiment);
    const avgSentiment =
      sentiments.length > 0
        ? sentiments.reduce(
            (sum, m) =>
              sum +
              (m.sentiment === 'positive' ? 1 : m.sentiment === 'negative' ? -1 : 0),
            0
          ) / sentiments.length
        : 0;

    return {
      duration,
      messageCount: messages.length,
      lastMessage,
      avgSentiment:
        avgSentiment > 0
          ? 'positive'
          : avgSentiment < 0
            ? 'negative'
            : 'neutral',
    };
  }
}
