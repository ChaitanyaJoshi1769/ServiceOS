import { Logger } from '@serviceos/shared';

const logger = new Logger('ChatService');

export interface ChatMessage {
  conversationId: string;
  senderId: string;
  senderType: 'customer' | 'agent' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export class ChatService {
  async sendMessage(message: ChatMessage): Promise<{ messageId: string; sent: boolean }> {
    logger.info(`Sending chat message in conversation ${message.conversationId}`);

    try {
      const messageId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      logger.debug('Chat message sent', {
        messageId,
        conversationId: message.conversationId,
        from: message.senderId,
      });

      return { messageId, sent: true };
    } catch (error) {
      logger.error('Failed to send chat message', error);
      return { messageId: 'error', sent: false };
    }
  }

  async startConversation(
    customerId: string,
    agentId?: string
  ): Promise<{ conversationId: string; started: boolean }> {
    logger.info(`Starting chat conversation for customer ${customerId}`);

    const conversationId = `conv_${Date.now()}`;

    const greeting: ChatMessage = {
      conversationId,
      senderId: agentId || 'system',
      senderType: agentId ? 'agent' : 'system',
      content: 'Hello! How can we help you today?',
      timestamp: new Date(),
    };

    await this.sendMessage(greeting);

    return { conversationId, started: true };
  }

  async endConversation(conversationId: string): Promise<void> {
    logger.info(`Ending chat conversation ${conversationId}`);

    const message: ChatMessage = {
      conversationId,
      senderId: 'system',
      senderType: 'system',
      content: 'Thank you for chatting with us. Goodbye!',
      timestamp: new Date(),
    };

    await this.sendMessage(message);
  }

  async getConversationHistory(
    conversationId: string,
    limit = 50
  ): Promise<ChatMessage[]> {
    logger.debug(`Retrieving history for conversation ${conversationId}`);

    // In production, fetch from database
    return [];
  }
}
